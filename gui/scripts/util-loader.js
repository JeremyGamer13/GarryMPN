// exposed to window
class UtilLoader {
    static queue = [];
    static queueBeingProcessed = false;

    static waitInQueue(id, message, callback) {
        const obj = {
            id,
            message,
            callback
        };
        this.queue.push(obj);
        this.processQueue();
    }

    static processQueue() {
        if (this.queueBeingProcessed) return;
        if (this.queue.length <= 0) return;

        const appBlur = document.getElementById("app-blur");
        const appBlurText = document.getElementById("app-blur-message");
        appBlur.dataset.enabled = true;
        this.queueBeingProcessed = true;
    
        return new Promise(async (resolve) => {
            const currentTask = this.queue.shift();
            appBlurText.innerText = currentTask.message;
            try {
                await currentTask.callback();
            } catch (err) {
                console.error("Failed to process", currentTask.id, err, currentTask);
            }

            this.queueBeingProcessed = false;
            if (this.queue.length <= 0) {
                appBlur.dataset.enabled = false;
                resolve();
                return;
            }

            return await this.processQueue();
        });
    }
}

window.UtilLoader = UtilLoader;