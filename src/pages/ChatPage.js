import React, { useState, useEffect } from 'react';

const ChatPage = () => {
  // conversationId’yi manuel belirleyebilirsiniz veya prop/route ile alabilirsiniz
  const [conversationId, setConversationId] = useState(3);

  // JWT token'i bir yerden almanız lazım (ör. login sonrası localStorage'a yazıldıysa)
  const [token, setToken] = useState(localStorage.getItem('access_token') || '');

  // Ekranda gösterilecek mesaj listesi
  const [messages, setMessages] = useState([]);

  // Kullanıcının input'a girdiği metin
  const [inputText, setInputText] = useState('');

  // Sunucu URL (NET Core API). Portu kendi projenize göre ayarlayın.
  const API_BASE_URL = 'http://localhost:5195';

  // useEffect: Bileşen yüklendiğinde veya conversationId/token değiştiğinde mesajları çek
  useEffect(() => {
    // Eğer token yoksa uyarı verebilir veya login ekranına yönlendirebilirsiniz
    if (!token) {
      console.warn('No token found. Please log in first or set your token.');
      return;
    }
    if (conversationId) {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, conversationId]);

  // 1) Mevcut mesajları sunucudan çekme fonksiyonu
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error('Fetch messages error:', res.status, res.statusText);
        return;
      }

      const data = await res.json();
      setMessages(data); // DB’den gelen tüm mesajları ekrana yansıt
    } catch (err) {
      console.error('Fetch messages exception:', err);
    }
  };

  // 2) Kullanıcı mesajını gönderme (POST)
  const handleSend = async () => {
    if (!inputText.trim()) return; // Boş mesaj göndermeyelim

    // Token yoksa uyarı ver
    if (!token) {
      console.error('Cannot send message: No token found.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: inputText }),
      });

      if (!res.ok) {
        console.error('Send message error:', res.status, res.statusText);
        return;
      }

      // Sunucudan { userMessage, assistantMessage } dönecek
      const data = await res.json();

      // User mesajı
      const userMsg = {
        role: 'user',
        content: data.userMessage,
      };
      // Asistan mesajı
      const assistantMsg = {
        role: 'assistant',
        content: data.assistantMessage,
      };

      // Ekrandaki message listesine ekle
      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Input temizle
      setInputText('');
    } catch (err) {
      console.error('Send message exception:', err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
      <h2>LLM Chat (Conversation {conversationId})</h2>

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
