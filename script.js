class BirthdayTracker {
    constructor() {
        this.birthdays = JSON.parse(localStorage.getItem('birthdays')) || [];
        this.currentEditId = null;
        this.initializeElements();
        this.attachEventListeners();
        this.renderBirthdays();
    }

    initializeElements() {
        this.modal = document.getElementById('modal');
        this.form = document.getElementById('birthdayForm');
        this.addButton = document.getElementById('addButton');
        this.cancelButton = document.getElementById('cancelButton');
        this.birthdayList = document.getElementById('birthdayList');
        this.editIdInput = document.getElementById('editId');
    }

    attachEventListeners() {
        this.addButton.addEventListener('click', () => this.openModal());
        this.cancelButton.addEventListener('click', () => this.closeModal());
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    openModal(birthdayId = null) {
        this.modal.classList.remove('hidden');
        if (birthdayId) {
            const birthday = this.birthdays.find(b => b.id === birthdayId);
            if (birthday) {
                this.currentEditId = birthdayId;
                document.getElementById('name').value = birthday.name;
                document.getElementById('birthdate').value = birthday.birthdate;
                document.getElementById('phone').value = birthday.phone;
            }
        } else {
            this.currentEditId = null;
            this.form.reset();
        }
    }

    closeModal() {
        this.modal.classList.add('hidden');
        this.form.reset();
        this.currentEditId = null;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            birthdate: document.getElementById('birthdate').value,
            phone: document.getElementById('phone').value,
        };

        const photoFile = document.getElementById('photo').files[0];
        if (photoFile) {
            formData.photo = await this.getBase64(photoFile);
        } else if (this.currentEditId) {
            const existingBirthday = this.birthdays.find(b => b.id === this.currentEditId);
            if (existingBirthday && existingBirthday.photo) {
                formData.photo = existingBirthday.photo;
            }
        }

        if (this.currentEditId) {
            this.updateBirthday(this.currentEditId, formData);
        } else {
            this.addBirthday(formData);
        }

        this.closeModal();
        this.renderBirthdays();
    }

    getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    addBirthday(birthday) {
        birthday.id = Date.now().toString();
        this.birthdays.push(birthday);
        this.saveBirthdays();
    }

    updateBirthday(id, updatedBirthday) {
        const index = this.birthdays.findIndex(b => b.id === id);
        if (index !== -1) {
            this.birthdays[index] = { ...this.birthdays[index], ...updatedBirthday, id };
            this.saveBirthdays();
        }
    }

    deleteBirthday(id) {
        this.birthdays = this.birthdays.filter(b => b.id !== id);
        this.saveBirthdays();
        this.renderBirthdays();
    }

    saveBirthdays() {
        localStorage.setItem('birthdays', JSON.stringify(this.birthdays));
    }

    renderBirthdays() {
        this.birthdayList.innerHTML = this.birthdays.map(birthday => `
            <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <div class="flex items-center space-x-4">
                    <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                        ${birthday.photo 
                            ? `<img src="${birthday.photo}" alt="${birthday.name}" class="w-full h-full object-cover">`
                            : `<div class="w-full h-full flex items-center justify-center text-center text-gray-500">Нет фото</div>`
                        }
                    </div>
                    <div class="flex-1">
                        <h3 class="font-semibold text-lg">${birthday.name}</h3>
                        <p class="text-gray-600">${new Date(birthday.birthdate).toLocaleDateString()}</p>
                        <p class="text-gray-600">${birthday.phone}</p>
                    </div>
                    <div class="flex flex-col space-y-2">
                        <button type="button" 
                                onclick="event.stopPropagation(); birthdayTracker.openModal('${birthday.id}')"
                                class="text-blue-500 hover:text-blue-700 px-3 py-1 rounded">
                            Редактировать
                        </button>
                        <button type="button"
                                onclick="event.stopPropagation(); birthdayTracker.deleteBirthday('${birthday.id}')"
                                class="text-red-500 hover:text-red-700 px-3 py-1 rounded">
                            Удалить
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

const birthdayTracker = new BirthdayTracker();