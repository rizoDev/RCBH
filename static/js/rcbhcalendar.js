/**
 * RCBH Calendar JavaScript
 * Google Calendar-like interface for managing events
 */

class RCBHCalendar {
    constructor() {
        this.currentDate = new Date();
        this.events = [];
        this.currentEvent = null;
        this.isEditing = false;
        
        this.initializeEventListeners();
        this.loadCalendar();
    }

    initializeEventListeners() {
        // Navigation buttons
        document.getElementById('prevMonth').addEventListener('click', () => this.previousMonth());
        document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());
        
        // Add event button
        document.getElementById('addEventBtn').addEventListener('click', () => this.openEventModal());
        
        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.closeEventModal());
        document.getElementById('closeDetailsModal').addEventListener('click', () => this.closeEventDetailsModal());
        document.getElementById('closeDetailsBtn').addEventListener('click', () => this.closeEventDetailsModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeEventModal());
        
        // Form submission
        document.getElementById('eventForm').addEventListener('submit', (e) => this.handleEventSubmit(e));
        
        // Delete buttons
        document.getElementById('deleteEventBtn').addEventListener('click', () => this.deleteEvent());
        document.getElementById('deleteEventFromDetailsBtn').addEventListener('click', () => this.deleteEvent());
        
        // Edit button - use arrow function to preserve 'this' context
        document.getElementById('editEventBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Edit button clicked');
            this.editEvent();
        });
        
        // Close modals when clicking outside
        document.getElementById('eventModal').addEventListener('click', (e) => {
            if (e.target.id === 'eventModal') {
                this.closeEventModal();
            }
        });
        
        document.getElementById('eventDetailsModal').addEventListener('click', (e) => {
            if (e.target.id === 'eventDetailsModal') {
                this.closeEventDetailsModal();
            }
        });
    }

    async loadCalendar() {
        await this.loadEvents();
        this.renderCalendar();
    }

    async loadEvents() {
        try {
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth() + 1;
            
            const response = await fetch(`/api/calendar/events?year=${year}&month=${month}`);
            if (response.ok) {
                this.events = await response.json();
            } else {
                console.error('Failed to load events');
                this.events = [];
            }
        } catch (error) {
            console.error('Error loading events:', error);
            this.events = [];
        }
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        document.getElementById('currentMonth').textContent = 
            `${monthNames[month]} ${year}`;

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay(); // 0 = Sunday

        // Clear calendar
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startDay; i++) {
            const dayElement = this.createDayElement(null, true);
            calendarDays.appendChild(dayElement);
        }

        // Add days of the month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            const isToday = dayDate.toDateString() === today.toDateString();
            const dayElement = this.createDayElement(day, false, isToday);
            calendarDays.appendChild(dayElement);
        }

        // Add events to calendar
        this.renderEvents();
    }

    createDayElement(dayNumber, isOtherMonth = false, isToday = false) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        if (dayNumber) {
            const dayNumberElement = document.createElement('div');
            dayNumberElement.className = 'calendar-day-number';
            dayNumberElement.textContent = dayNumber;
            dayElement.appendChild(dayNumberElement);
            
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'calendar-events';
            dayElement.appendChild(eventsContainer);
            
            // Add click event to create new event
            dayElement.addEventListener('click', () => {
                if (!isOtherMonth) {
                    // Create date string in YYYY-MM-DD format to avoid timezone issues
                    const year = this.currentDate.getFullYear();
                    const month = String(this.currentDate.getMonth() + 1).padStart(2, '0');
                    const day = String(dayNumber).padStart(2, '0');
                    const dateString = `${year}-${month}-${day}`;
                    this.openEventModal(dateString);
                }
            });
        }
        
        return dayElement;
    }

    renderEvents() {
        const dayElements = document.querySelectorAll('.calendar-day:not(.other-month)');
        
        dayElements.forEach((dayElement, index) => {
            const dayNumber = parseInt(dayElement.querySelector('.calendar-day-number')?.textContent);
            if (!dayNumber) return;
            
            const dayDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), dayNumber);
            const dayEvents = this.events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.toDateString() === dayDate.toDateString();
            });
            
            const eventsContainer = dayElement.querySelector('.calendar-events');
            eventsContainer.innerHTML = '';
            
            dayEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'calendar-event wheat';
                eventElement.textContent = `${event.start_time} ${event.title}`;
                eventElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showEventDetails(event);
                });
                eventsContainer.appendChild(eventElement);
            });
        });
    }

    openEventModal(date = null) {
        this.isEditing = false;
        this.currentEvent = null;
        
        document.getElementById('modalTitle').textContent = 'Add Event';
        document.getElementById('eventForm').reset();
        document.getElementById('eventId').value = '';
        document.getElementById('deleteEventBtn').classList.add('hidden');
        
        // Set the date field
        const dateInput = document.getElementById('eventDate');
        if (date) {
            if (date instanceof Date) {
                // Handle Date object
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                dateInput.value = `${year}-${month}-${day}`;
            } else if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Handle date string in YYYY-MM-DD format
                dateInput.value = date;
            }
        } else {
            // Default to today's date
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
        }
        
        // Set default times
        document.getElementById('startTime').value = '09:00';
        document.getElementById('endTime').value = '10:00';
        
        document.getElementById('eventModal').classList.remove('hidden');
    }

    closeEventModal() {
        document.getElementById('eventModal').classList.add('hidden');
        this.currentEvent = null;
        this.isEditing = false;
    }

    async handleEventSubmit(e) {
        e.preventDefault();
        
        // Get form elements
        const titleInput = document.getElementById('eventTitle');
        const dateInput = document.getElementById('eventDate');
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');
        const descriptionInput = document.getElementById('eventDescription');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        // Validate required fields
        if (!titleInput.value.trim()) {
            this.showNotification('Event title is required', 'error');
            return;
        }
        
        if (!dateInput.value) {
            this.showNotification('Event date is required', 'error');
            return;
        }
        
        if (!startTimeInput.value || !endTimeInput.value) {
            this.showNotification('Start and end times are required', 'error');
            return;
        }
        
        // Set loading state
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        const eventData = {
            title: titleInput.value.trim(),
            date: dateInput.value,
            start_time: startTimeInput.value,
            end_time: endTimeInput.value,
            description: descriptionInput.value.trim()
        };
        
        try {
            let response;
            if (this.isEditing && this.currentEvent) {
                // Update existing event
                response = await fetch(`/api/calendar/events/${this.currentEvent.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventData)
                });
            } else {
                // Create new event
                response = await fetch('/api/calendar/events', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventData)
                });
            }
            
            if (response.ok) {
                this.closeEventModal();
                await this.loadCalendar();
                this.showNotification('Event saved successfully!', 'success');
            } else {
                const error = await response.json();
                this.showNotification(error.error || 'Failed to save event', 'error');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            this.showNotification('Failed to save event', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    showEventDetails(event) {
        console.log('showEventDetails called with event:', event);
        this.currentEvent = event;
        
        const detailsHtml = `
            <div class="mb-4">
                <h4 class="text-lg font-semibold text-charcoal mb-2">${event.title}</h4>
                <div class="space-y-2 text-sm text-gray-600">
                    <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${event.start_time} - ${event.end_time}</p>
                    ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
                </div>
            </div>
        `;
        
        document.getElementById('eventDetails').innerHTML = detailsHtml;
        document.getElementById('eventDetailsModal').classList.remove('hidden');
        
        console.log('Event details modal opened, currentEvent set to:', this.currentEvent);
        
        // Re-attach event listeners after content is updated
        this.attachEventDetailsListeners();
    }

    closeEventDetailsModal() {
        document.getElementById('eventDetailsModal').classList.add('hidden');
        this.currentEvent = null;
    }

    attachEventDetailsListeners() {
        // Remove existing listeners to avoid duplicates
        const editBtn = document.getElementById('editEventBtn');
        const newEditBtn = editBtn.cloneNode(true);
        editBtn.parentNode.replaceChild(newEditBtn, editBtn);
        
        // Add new event listener
        document.getElementById('editEventBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Edit button clicked from details modal');
            this.editEvent();
        });
        
        // Also ensure delete button works
        const deleteBtn = document.getElementById('deleteEventFromDetailsBtn');
        const newDeleteBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
        
        document.getElementById('deleteEventFromDetailsBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Delete button clicked from details modal');
            this.deleteEvent();
        });
    }

    editEvent() {
        console.log('editEvent called, currentEvent:', this.currentEvent);
        
        if (!this.currentEvent) {
            console.error('No current event to edit');
            return;
        }
        
        this.closeEventDetailsModal();
        this.isEditing = true;
        
        document.getElementById('modalTitle').textContent = 'Edit Event';
        document.getElementById('eventId').value = this.currentEvent.id;
        document.getElementById('eventTitle').value = this.currentEvent.title;
        document.getElementById('eventDate').value = this.currentEvent.date;
        document.getElementById('startTime').value = this.currentEvent.start_time;
        document.getElementById('endTime').value = this.currentEvent.end_time;
        document.getElementById('eventDescription').value = this.currentEvent.description || '';
        document.getElementById('deleteEventBtn').classList.remove('hidden');
        
        document.getElementById('eventModal').classList.remove('hidden');
        
        console.log('Edit modal opened for event:', this.currentEvent.title);
    }

    async deleteEvent() {
        if (!this.currentEvent) return;
        
        if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/calendar/events/${this.currentEvent.id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.closeEventModal();
                this.closeEventDetailsModal();
                await this.loadCalendar();
                this.showNotification('Event deleted successfully!', 'success');
            } else {
                const error = await response.json();
                this.showNotification(error.error || 'Failed to delete event', 'error');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            this.showNotification('Failed to delete event', 'error');
        }
    }

    async previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        await this.loadCalendar();
    }

    async nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        await this.loadCalendar();
    }

    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RCBHCalendar();
});
