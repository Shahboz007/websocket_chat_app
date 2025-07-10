document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('cc_token');
    if (!token) {
        window.location.href = '/callcenter/login';
        return;
    }

    const activeChatsList = document.getElementById('active-chats-list');
    const refreshBtn = document.getElementById('refresh-btn');

    const chatWindow = document.getElementById('chat-window');
    const chatWindowPlaceholder = document.getElementById('chat-window-placeholder');
    const chatHeader = document.getElementById('chat-header');
    const chatBox = document.getElementById('chat-box');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const completeChatBtn = document.getElementById('complete-chat-btn');

    let currentRoomId = null;
    let ws = null;

    async function fetchActiveChats() {
        try {
            const response = await fetch('/api/chats/active', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch chats.');

            const chats = await response.json();
            activeChatsList.innerHTML = '';

            if (chats.length === 0) {
                activeChatsList.innerHTML = '<p class="p-3 text-muted">No active chats at the moment.</p>';
                return;
            }

            chats.forEach(chat => {
                const chatItem = document.createElement('a');
                chatItem.href = '#';
                chatItem.className = 'list-group-item list-group-item-action';
                chatItem.dataset.roomId = chat.id;
                chatItem.dataset.username = chat.User.username;
                chatItem.textContent = `Chat with ${chat.User.username} (ID: ${chat.id})`;
                chatItem.onclick = (e) => {
                    e.preventDefault();
                    joinChat(chat.id, chat.User.username);
                };
                activeChatsList.appendChild(chatItem);
            });
        } catch (error) {
            console.error('Error fetching active chats:', error);
            activeChatsList.innerHTML = '<p class="p-3 text-danger">Could not load chats.</p>';
        }
    }

    function joinChat(roomId, username) {
        if (ws) {
            ws.close();
        }

        currentRoomId = roomId;
        chatBox.innerHTML = '';
        chatHeader.textContent = `Chat with ${username}`;

        chatWindowPlaceholder.classList.add('d-none');
        chatWindow.classList.remove('d-none');

        ws = new WebSocket(`ws://${window.location.host}/ws?token=${token}`);

        ws.onopen = () => {
            console.log('WebSocket connected. Joining room...');
            ws.send(JSON.stringify({ type: 'join_room', roomId: currentRoomId }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message') {
                appendMessage(data.payload);
            } else if (data.type === 'past_messages') {
                data.payload.forEach(appendMessage);
            } else if (data.type === 'chat_completed') {
                alert('This chat was closed.');
                resetChatWindow();
                fetchActiveChats();
            }
        };

        ws.onclose = () => {
            console.log(`WebSocket connection for room ${currentRoomId} closed.`);
        };
    }

    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (message && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'chat_message',
                roomId: currentRoomId,
                message: message
            }));
            messageInput.value = '';
        }
    });

    completeChatBtn.addEventListener('click', async () => {
        console.log('currentRoomId', token);
        if (!currentRoomId) return;
        if (confirm('Are you sure you want to mark this chat as completed? This action cannot be undone.')) {
            try {
                await fetch('/api/chats/complete', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ roomId: currentRoomId })
                });
                
            } catch (error) {
                console.error('Failed to complete chat:', error);
                alert('Could not complete the chat. Please try again.');
            }
        }
    });

    function resetChatWindow() {
        chatWindow.classList.add('d-none');
        chatWindowPlaceholder.classList.remove('d-none');
        currentRoomId = null;
        if (ws) ws.close();
    }

    function appendMessage(msg) {
        const messageElement = document.createElement('div');
        const isAgent = msg.senderRole === 'callcenter';

        messageElement.classList.add('mb-2', 'd-flex', isAgent ? 'justify-content-end' : 'justify-content-start');

        // Bubble container
        const bubble = document.createElement('div');
        bubble.classList.add('p-2', 'rounded', 'mw-75', 'shadow-sm', 'position-relative');
        bubble.classList.add(isAgent ? 'bg-success' : 'bg-light', isAgent ? 'text-white' : 'text-dark');
        bubble.style.maxWidth = '75%';
        bubble.style.minWidth = '120px';

        // Avatar
        const avatar = document.createElement('span');
        avatar.className = 'me-2';
        avatar.innerHTML = isAgent
            ? '<i class="bi bi-headset" style="font-size:1.5rem;color:#198754;"></i>'
            : '<i class="bi bi-person-circle" style="font-size:1.5rem;"></i>';

        // Sender label
        const sender = document.createElement('div');
        sender.className = 'small fw-bold mb-1';
        sender.textContent = isAgent ? 'You' : 'User';
        if (isAgent) sender.style.color = '#198754';
        else sender.style.color = '#0d6efd';

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

        if (isAgent) {
            messageElement.appendChild(bubble);
            messageElement.appendChild(avatar);
        } else {
            messageElement.appendChild(avatar);
            messageElement.appendChild(bubble);
        }

        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Initial load and setup
    refreshBtn.addEventListener('click', fetchActiveChats);
    fetchActiveChats();
});