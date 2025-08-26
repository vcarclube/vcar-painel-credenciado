import React, { useEffect, useState } from 'react';
import { FiSearch, FiSend, FiChevronLeft, FiMessageCircle } from 'react-icons/fi';
import { Header, Sidebar, BottomNavigation } from '../../components';
import './style.css';

const Suporte = () => {
    const [selectedContact, setSelectedContact] = useState(null);
    const [message, setMessage] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showContactList, setShowContactList] = useState(true);

    // Dados de exemplo dos contatos
    const [contacts] = useState([
        {
            id: 1,
            name: 'CINTIA FERREIRA',
            email: 'cintiaferreira@vcarclub.com.br',
            status: 'GESTÃO',
            lastMessage: 'Olá! Como posso ajudar?',
            time: '14:30',
            unread: 2
        },
        {
            id: 2,
            name: 'ANDREIA BRITO',
            email: 'andreiabrito@vcarclub.com.br',
            status: 'ADMINISTRAÇÃO',
            lastMessage: 'Documentos enviados',
            time: '13:45',
            unread: 0
        },
        {
            id: 3,
            name: 'DYLLAN NICOLAU',
            email: 'dyllannicolau@vcarclub.com.br',
            status: 'ADMINISTRAÇÃO',
            lastMessage: 'Aguardando retorno',
            time: '12:20',
            unread: 1
        },
        {
            id: 4,
            name: 'LUCAS SILVA',
            email: 'lucassilva@vcarclub.com.br',
            status: 'OPERAÇÃO',
            lastMessage: 'Processo finalizado',
            time: '11:15',
            unread: 0
        }
    ]);

    // Mensagens de exemplo
    const [messages] = useState([
        {
            id: 1,
            contactId: 1,
            sender: 'contact',
            text: 'Olá! Como posso ajudar você hoje?',
            time: '14:30'
        },
        {
            id: 2,
            contactId: 1,
            sender: 'user',
            text: 'Preciso de ajuda com o sistema',
            time: '14:32'
        },
        {
            id: 3,
            contactId: 1,
            sender: 'contact',
            text: 'Claro! Qual é a dificuldade específica?',
            time: '14:33'
        }
    ]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleContactSelect = (contact) => {
        setSelectedContact(contact);
        if (isMobile) {
            setShowContactList(false);
        }
    };

    const handleBackToContacts = () => {
        setShowContactList(true);
        setSelectedContact(null);
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            // Aqui você implementaria o envio da mensagem
            console.log('Enviando mensagem:', message);
            setMessage('');
        }
    };

    const getContactMessages = (contactId) => {
        return messages.filter(msg => msg.contactId === contactId);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'GESTÃO':
                return '#01ce7c';
            case 'ADMINISTRAÇÃO':
                return '#f59e0b';
            case 'OPERAÇÃO':
                return '#3b82f6';
            default:
                return '#6b7280';
        }
    };

    React.useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) {
                setShowContactList(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="page-container">
            <Header />
            <div className="content-wrapper">
                <Sidebar />
                <main className="main-content" style={{ paddingBottom: '0px', marginBottom: '0px', minHeight: '0vh' }}>
                    <center>
                        <div className="suporte-container">

                            <div className="suporte-chat-container">
                                {/* Lista de Contatos */}
                                <div className={`suporte-contacts ${!showContactList && isMobile ? 'suporte-contacts-hidden' : ''}`}>
                                    <div className="suporte-contacts-header">
                                        <h3>PESQUISAR CONTATOS DO SUPORTE</h3>
                                        <div className="suporte-search">
                                            <FiSearch className="suporte-search-icon" />
                                            <input
                                                type="text"
                                                placeholder="Buscar contato..."
                                                className="suporte-search-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="suporte-contacts-list">
                                        {contacts.map(contact => (
                                            <div
                                                key={contact.id}
                                                className={`suporte-contact-item ${selectedContact?.id === contact.id ? 'suporte-contact-selected' : ''
                                                    }`}
                                                onClick={() => handleContactSelect(contact)}
                                            >
                                                <div className="suporte-contact-info">
                                                    <div className="suporte-contact-header">
                                                        <h4>{contact.name}</h4>
                                                        <span
                                                            className="suporte-contact-status"
                                                            style={{ backgroundColor: getStatusColor(contact.status) }}
                                                        >
                                                            {contact.status}
                                                        </span>
                                                    </div>
                                                    <p className="suporte-contact-email">{contact.email}</p>
                                                    <p className="suporte-contact-last-message">{contact.lastMessage}</p>
                                                </div>
                                                <div className="suporte-contact-meta">
                                                    <span className="suporte-contact-time">{contact.time}</span>
                                                    {contact.unread > 0 && (
                                                        <span className="suporte-contact-unread">{contact.unread}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Área de Conversa */}
                                <div className={`suporte-chat ${showContactList && isMobile ? 'suporte-chat-hidden' : ''}`}>
                                    {selectedContact ? (
                                        <>
                                            <div className="suporte-chat-header">
                                                {isMobile && (
                                                    <button
                                                        className="suporte-back-btn"
                                                        onClick={handleBackToContacts}
                                                    >
                                                        <FiChevronLeft />
                                                    </button>
                                                )}
                                                <div className="suporte-chat-contact-info">
                                                    <h3>{selectedContact.name}</h3>
                                                    <span
                                                        className="suporte-chat-status"
                                                        style={{ backgroundColor: getStatusColor(selectedContact.status) }}
                                                    >
                                                        {selectedContact.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="suporte-messages">
                                                {getContactMessages(selectedContact.id).map(msg => (
                                                    <div
                                                        key={msg.id}
                                                        className={`suporte-message ${msg.sender === 'user' ? 'suporte-message-user' : 'suporte-message-contact'
                                                            }`}
                                                    >
                                                        <div className="suporte-message-content">
                                                            <p>{msg.text}</p>
                                                            <span className="suporte-message-time">{msg.time}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="suporte-message-input">
                                                <input
                                                    type="text"
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="Digite sua mensagem..."
                                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                />
                                                <button
                                                    className="suporte-send-btn"
                                                    onClick={handleSendMessage}
                                                    disabled={!message.trim()}
                                                >
                                                    <FiSend />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="suporte-no-chat">
                                            <FiMessageCircle className="suporte-no-chat-icon" />
                                            <h3>Selecione um contato</h3>
                                            <p>Escolha um contato da lista para iniciar uma conversa</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </center>
                </main>
            </div>
            <BottomNavigation />
        </div>
    );
};

export default Suporte;