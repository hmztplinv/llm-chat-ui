import React, { useState, useEffect } from 'react';

const ChatPage = () => {
  // conversationId başlangıçta null veya undefined
  const [conversationId, setConversationId] = useState(null);

  const [token] = useState(localStorage.getItem('access_token') || '');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const API_BASE_URL = 'http://localhost:5195';

  // 1) Bileşen yüklendiğinde veya token değiştiğinde conversation ID bulalım
  useEffect(() => {
    if (!token) {
      console.warn('No token found, please login first.');
      return;
    }
    fetchOrCreateConversation();
    // eslint-disable-next-line
  }, [token]);

  // Bu fonksiyon önce GET /api/conversations ile liste çeker,
  // eğer boş ise POST /api/conversations ile yeni bir tane oluşturur.
  const fetchOrCreateConversation = async () => {
    try {
      // Mevcut konuşmaları listele
      const res = await fetch(`${API_BASE_URL}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        console.error('Fetch conversations error:', res.statusText);
        return;
      }
      const convData = await res.json();
      if (convData.length > 0) {
        // İlk conversation'ı seçelim (isterseniz bir listeyi user'a gösterip seçtirin)
        setConversationId(convData[0].id);
      } else {
        // Hiç conversation yoksa yeni bir tane oluştur
        const createRes = await fetch(`${API_BASE_URL}/api/conversations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ topicTitle: 'My First Chat' })
        });
        if (!createRes.ok) {
          console.error('Create conversation error:', createRes.statusText);
          return;
        }
        const newConv = await createRes.json();
        setConversationId(newConv.id);
      }
    } catch (err) {
      console.error('fetchOrCreateConversation exception:', err);
    }
  };

  // 2) Mesajları çekme fonksiyonu
  const fetchMessages = async (convId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        console.error('Fetch messages error:', res.statusText);
        return;
      }
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Fetch messages exception:', err);
    }
  };

  // conversationId değiştiğinde mesajları çek
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
    // eslint-disable-next-line
  }, [conversationId]);

  // 3) Kullanıcı mesajı gönderme
  const handleSend = async () => {
    if (!inputText.trim() || !conversationId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: inputText })
      });

      if (!res.ok) {
        console.error('Send message error:', res.statusText);
        return;
      }

      // Sunucudan { userMessage, assistantMessage }
      const data = await res.json();
      // user message
      const userMsg = { role: 'user', content: data.userMessage };
      // assistant message
      const assistantMsg = { role: 'assistant', content: data.assistantMessage };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInputText('');
    } catch (err) {
      console.error('Send message exception:', err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
      <h2>LLM Chat {conversationId && `(Conversation ${conversationId})`}</h2>

      <div style={{
        border: '1px solid #ccc',
        padding: '1rem',
        height: '400px',
        overflowY: 'auto'
      }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              margin: '0.5rem 0',
              textAlign: msg.role === 'assistant' ? 'right' : 'left'
            }}
          >
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ width: '80%', marginRight: '1rem' }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
