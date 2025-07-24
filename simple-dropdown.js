function Dropdown(element) {
    this.element = element;
    this.element.setAttribute('data-dropdown-init', true);
    this.id = this.element.getAttribute('data-id');
    this.currentIndex = -1;
    this.open = false;

    //? Internal data
    const checkbox = this.element.querySelector('.skeleton-input-checkbox');
    const selectElement = this.element.querySelector('.skeleton-select');
    const text = this.element.querySelector('.label .text');
    const label = this.element.querySelector('.label .placeholder');
    const defaultLabelValue = label.textContent;
    const fn = {
        onSelected: () =>  {
            const event = new Event('dropdown.selected');
            this.element.dispatchEvent(event);

            const changeEvent = new Event('change', { bubbles: true });
            selectElement.dispatchEvent(changeEvent);
        }
    }

    this._optionElement = this.element.querySelector('.options');
    this._options = this._optionElement.querySelectorAll('.options div');
    this.__proto__ = {
        /**
         * Version of the dropdown
         */
        version: '1.20.1',
        
        /**
         *
         * @param {'[{title: "", value: ""}, {title: "", value: ""}, ...]'} arrayObject
         * @param {number} toIndex
         * @returns
         */
        add: function (arrayObject, toIndex) {
            if (arrayObject.length <= 0) {
                return;
            }

            arrayObject.forEach((objItem) => {
                const div = document.createElement('div');
                div.setAttribute('data-value', objItem.value);
                div.innerHTML = objItem.title;
                this.initOptionEvent(div);

                const option = document.createElement('option');
                option.value = objItem.value;
                selectElement.appendChild(option);

                if (typeof toIndex === 'number' && toIndex >= 0) {
                    this._optionElement.insertBefore(
                        div,
                        this._options[toIndex]
                    );
                    selectElement.insertBefore(option, selectElement[toIndex]);
                } else {
                    this._optionElement.appendChild(div);
                    selectElement.appendChild(option);
                }
            });
            this.update();
        },

        /**
         * @param {number | string} index
         */
        remove: function (index) {
            if (!this.isNumber(index)) {
                index = this.findIndexFromValue(index);
            }

            if (typeof this._options[index] === 'undefined') {
                return;
            }

            this._options[index].remove();
            selectElement[index].remove();
            if (this.currentIndex != null && this.currentIndex === index) {
                this.currentIndex = null;
                text.textContent = '';
                selectElement.value = '';
                selectElement.classList.remove('selected');
            }

            this.update();
        },

        /**
         * @param {number | string} index
         */
        select: function (index) {
            if (typeof index !== 'number') {
                index = this.findIndexFromValue(index);
            }

            if (typeof this._options[index] === 'undefined') {
                return;
            }

            this._options[index].click();
        },
        update: function () {
            this._options =
                this._optionElement.querySelectorAll('.options div');
            this.currentIndex = this.findIndexFromValue();
        },
        isNumber: function (value) {
            return typeof value === 'number';
        },
        findIndexFromValue: function (value) {
            if (typeof value === 'undefined' && this.getValue().length > 0) {
                value = this.getValue();
            }
            const option = this._optionElement.querySelector(
                '[data-value="' + value + '"]'
            );

            return this.findIndex(option);
        },
        findIndex: function (element) {
            return Array.prototype.indexOf.call(this._options, element);
        },
        getTitle: function () {
            if (this.getIndex() < 0) {
                return;
            }
            return selectElement[this.currentIndex].textContent.trim();
        },
        getValue: function () {
            return selectElement.value;
        },
        getIndex: function () {
            return this.currentIndex;
        },
        getLabel: function () {
            return label.textContent;
        },
        getSelected: function () {
            return this._options[this.currentIndex];
        },
        setLabel: function (value) {
            if (
                typeof value === 'undefined' ||
                typeof value === 'boolean' ||
                value.length <= 0
            ) {
                this.removeLabel(value);
            } else {
                label.textContent = value;
            }
        },
        removeLabel: function (useDefault) {
            if (typeof useDefault === 'boolean' && useDefault === true) {
                label.textContent = defaultLabelValue;
            } else {
                label.textContent = '';
            }
        },
        initOptions: function () {
            this._options.forEach((option) => {
                this.initOptionEvent(option);
            });
        },
        initOptionEvent: function (option) {
            option.addEventListener('click', () => {
                this.currentIndex = this.findIndex(option);

                const selectedValue = option.getAttribute('data-value');

                text.textContent = option.textContent;

                const selectOption = selectElement.querySelector(
                    'option[value="' + selectedValue + '"]'
                );
                
                if (selectOption) {
                    selectElement.value = selectedValue;
                    selectElement.classList.add('selected');
                    this.clearOptionsSelected();
                    option.classList.add('selected');
                }

                checkbox.checked = false;

                this.open = checkbox.checked;

                fn.onSelected();
            });
        },
        initClickOutside: function () {
            document.addEventListener('click', (event) => {
                const target = event.target;
                if (!this.element.contains(target)) {
                    checkbox.checked = false;
                }
            });
        },
        initChangeCheckbox: function() {
            checkbox.addEventListener('change', (event) => {
                this.open = event.target.checked;
                if (this.open) {
                    const selectedOption = this.getSelected();
                    if (selectedOption) {
                        this._optionElement.scrollTop = selectedOption.offsetTop - this._optionElement.offsetTop;
                    }
                } 
            });
        },
        clear: function() {
            this.currentIndex = -1;
            text.textContent = '';
            selectElement.value = '';
            selectElement.classList.remove('selected');
            checkbox.checked = false;
            this.open = false;
            this._optionElement.innerHTML = '';
        },
        clearOptionsSelected: function() {
            this._options.forEach((option) => { option.classList.remove('selected')});
        }
    };

    this.initOptions();
    this.initClickOutside();
    this.initChangeCheckbox();
}
