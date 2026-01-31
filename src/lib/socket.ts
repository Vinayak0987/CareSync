import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;

    connect(): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinAppointment(appointmentId: string) {
        if (this.socket) {
            this.socket.emit('join-appointment', appointmentId);
        }
    }

    leaveAppointment(appointmentId: string) {
        if (this.socket) {
            this.socket.emit('leave-appointment', appointmentId);
        }
    }

    sendMessage(data: {
        appointmentId: string;
        senderId: string;
        senderRole: 'doctor' | 'patient';
        message: string;
    }) {
        if (this.socket) {
            this.socket.emit('send-message', data);
        }
    }

    onReceiveMessage(callback: (message: any) => void) {
        if (this.socket) {
            this.socket.on('receive-message', callback);
        }
    }

    offReceiveMessage() {
        if (this.socket) {
            this.socket.off('receive-message');
        }
    }

    // WebRTC Signaling Methods
    callUser(appointmentId: string, offer: any) {
        if (this.socket) {
            this.socket.emit('call-user', { appointmentId, offer });
        }
    }

    makeAnswer(appointmentId: string, answer: any) {
        if (this.socket) {
            this.socket.emit('make-answer', { appointmentId, answer });
        }
    }

    sendIceCandidate(appointmentId: string, candidate: any) {
        if (this.socket) {
            this.socket.emit('ice-candidate', { appointmentId, candidate });
        }
    }

    onCallMade(callback: (data: { offer: any, socketId: string }) => void) {
        if (this.socket) {
            this.socket.on('call-made', callback);
        }
    }

    onAnswerMade(callback: (data: { answer: any, socketId: string }) => void) {
        if (this.socket) {
            this.socket.on('answer-made', callback);
        }
    }

    onIceCandidateReceived(callback: (data: { candidate: any, socketId: string }) => void) {
        if (this.socket) {
            this.socket.on('ice-candidateReceived', callback);
        }
    }

    // Cleanup WebRTC listeners
    offWebRTC() {
        if (this.socket) {
            this.socket.off('call-made');
            this.socket.off('answer-made');
            this.socket.off('ice-candidateReceived');
        }
    }

    onMessageError(callback: (error: any) => void) {
        if (this.socket) {
            this.socket.on('message-error', callback);
        }
    }
}

export const socketService = new SocketService();
