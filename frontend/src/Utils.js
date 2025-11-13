import { toast } from 'react-toastify';

const Utils = {
    validateEmail: (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    },
    stringIsNullOrEmpty: (str) => {
        return !str || str?.trim() === "" || str == null || str == undefined;
    },
    formatCurrency: (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },
    notify: (type, message) => {
        switch (type) {
            case "success":
                toast.success(message, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                })
                break;
            case "error":
                toast.error(message, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                })
                break;
            case "warning":
                toast.warning(message, {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                })
                break;
        }
    },
    formatBrazilDateTime: (value) => {
        if (!value) return { date: '-', time: '-' };
        const str = String(value).trim();

        // Caso ISO (com T e possivelmente Z/offset), tratar de forma "naive":
        // ignorar timezone do sufixo e exibir exatamente o horário fornecido.
        const isoMatch = str.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/i);
        if (isoMatch) {
        const [, yyyy, mm, dd, hh, min] = isoMatch;
        return { date: `${dd}/${mm}/${yyyy}`, time: `${hh}:${min}` };
        }

        // Caso SQL-like "YYYY-MM-DD HH:mm:ss" ou "YYYY-MM-DD HH:mm"
        const sqlMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
        if (sqlMatch) {
        const [, yyyy, mm, dd, hh, min] = sqlMatch;
        const date = `${dd}/${mm}/${yyyy}`;
        const time = `${hh}:${min}`;
        return { date, time };
        }

        // Caso já esteja em pt-BR "dd/mm/aaaa HH:mm" ou "dd/mm/aaaa, HH:mm"
        const brMatch = str.match(/^(\d{2}\/\d{2}\/\d{4})[ ,]+(\d{2}:\d{2})$/);
        if (brMatch) {
        const [, date, time] = brMatch;
        return { date, time };
        }

        // Fallback: tentar Date com timezone BR
        try {
            const d = new Date(str);
            if (!isNaN(d.getTime())) {
                const timeZone = 'America/Sao_Paulo';
                const date = new Intl.DateTimeFormat('pt-BR', {
                timeZone,
                day: '2-digit', month: '2-digit', year: 'numeric'
                }).format(d);
                const time = new Intl.DateTimeFormat('pt-BR', {
                timeZone,
                hour: '2-digit', minute: '2-digit', hour12: false
                }).format(d);
                return { date, time };
            }
        } catch {}

        // Último recurso: devolver string original separando por espaço vírgula
        const parts = str.replace(',', ' ').split(' ').filter(Boolean);
        return { date: parts[0] || str, time: parts[1] || '' };
    }
}

export default Utils;