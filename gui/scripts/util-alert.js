// exposed to window
class UtilAlert {
    static showAlert(icon, text) {
        let url = icon;
        switch (icon) {
            case "info":
                url = "asset://asset/alert-info.png";
                break;
            case "alert":
                url = "asset://asset/alert-important.png";
                break;
            case "error":
                url = "asset://asset/alert-error.png";
                break;
        }

        const alertsDiv = document.getElementById("app-alerts");

        const alert = document.createElement("div");
        const alertIcon = document.createElement("img");
        const alertMessage = document.createElement("span");
        alert.dataset.deleting = false;
        alertIcon.src = url;
        alertMessage.innerText = text;

        alert.appendChild(alertIcon);
        alert.appendChild(alertMessage);
        alertsDiv.prepend(alert);

        setTimeout(() => {
            alert.dataset.deleting = true;
            setTimeout(() => {
                alert.remove();
            }, 750);
        }, 3000);

        return alert;
    }
}

window.UtilAlert = UtilAlert;