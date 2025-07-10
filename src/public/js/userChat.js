// src/public/js/userChat.js

document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const token = localStorage.getItem('user_token');

    if (!token) {
        window.location.href = '/user/login';
        return;
    }

    // Clear the initial "Connecting..." message
    chatBox.innerHTML = '';

    const ws = new WebSocket(`ws://${window.location.host}/ws?token=${token}`);

    ws.onopen = () => {
        console.log('WebSocket connection established.');
        const statusDiv = document.createElement('div');
        statusDiv.className = 'text-center text-muted small my-2';
        statusDiv.textContent = 'Connection successful. Waiting for a support agent...';
        chatBox.appendChild(statusDiv);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'new_message') {
            appendMessage(data.payload);
        } else if (data.type === 'chat_completed') {
            alert(data.message);
            messageInput.disabled = true;
            messageForm.querySelector('button').disabled = true;
        } else if (data.type === 'past_messages') {
            chatBox.innerHTML = '';
            if (data.payload.length === 0) {
                document.getElementById('no-messages').classList.remove('d-none');
            } else {
                document.getElementById('no-messages').classList.add('d-none');
                data.payload.forEach(msg => appendMessage(msg));
            }
        }
    };

    ws.onclose = (event) => {
        console.log('WebSocket connection closed.', event.reason);
        const statusDiv = document.createElement('div');
        statusDiv.className = 'alert alert-danger';
        statusDiv.textContent = 'Connection to the server has been lost. Please refresh the page.';
        chatBox.appendChild(statusDiv);
        messageInput.disabled = true;
        messageForm.querySelector('button').disabled = true;
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message && ws.readyState === WebSocket.OPEN) {
            // The room ID for a user is their own ID from the token
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const payload = {
                type: 'chat_message',
                roomId: String(decodedToken.id),
                message: message,
            };
            ws.send(JSON.stringify(payload));
            messageInput.value = '';
        }
    });

    function appendMessage(msg) {
        const messageElement = document.createElement('div');
        const isMe = msg.senderRole === 'user';

        messageElement.classList.add('mb-2', 'd-flex', isMe ? 'justify-content-end' : 'justify-content-start');

        // Bubble container
        const bubble = document.createElement('div');
        bubble.classList.add('p-2', 'rounded', 'mw-75', 'shadow-sm', 'position-relative');
        bubble.classList.add(isMe ? 'bg-primary' : 'bg-light', isMe ? 'text-white' : 'text-dark');
        bubble.style.maxWidth = '75%';
        bubble.style.minWidth = '120px';

        // Avatar
        const avatar = document.createElement('span');
        avatar.className = 'me-2';
        avatar.innerHTML = isMe
            ? '<i class="bi bi-person-circle" style="font-size:1.5rem;"></i>'
            : '<i class="bi bi-headset" style="font-size:1.5rem;color:#0d6efd;"></i>';

        // Sender label
        const sender = document.createElement('div');
        sender.className = 'small fw-bold mb-1';
        sender.textContent = isMe ? 'You' : 'Support';
        if (!isMe) sender.style.color = '#0d6efd';

        // Message text
        const text = document.createElement('div');
        text.textContent = msg.message;
        text.className = 'mb-1';

        // Timestamp
        const time = document.createElement('div');
        time.className = 'small text-end';
        const date = new Date(msg.createdAt || Date.now());
        time.textContent = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        time.style.opacity = '0.7';

        // Bubble content
        bubble.appendChild(sender);
        bubble.appendChild(text);
        bubble.appendChild(time);

        if (isMe) {
            messageElement.appendChild(bubble);
            messageElement.appendChild(avatar);
        } else {
            messageElement.appendChild(avatar);
            messageElement.appendChild(bubble);
        }

        chatBox.appendChild(messageElement);
        // Scroll to the bottom
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});