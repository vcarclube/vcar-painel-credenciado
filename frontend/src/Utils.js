import { toast } from 'react-toastify';

const Utils = {
    validateEmail: (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    },
    stringIsNullOrEmpty: (str) => {
        return !str || str?.trim() === "" || str == null || str == undefined;
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
}

export default Utils;