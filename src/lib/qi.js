
/**
 * Safe wrapper for Qi Mini App 'my' global object.
 * Prevents errors in non-MiniApp environments (like standard browsers during dev).
 */

const isMyDefined = typeof my !== 'undefined';

export const qi = {
    showToast: (options) => {
            my.showToast(options);
    },
    showLoading: (options) => {
            my.showLoading(options);
    },
    hideLoading: () => {
            my.hideLoading();
    },
    getLocation: (options) => {
            my.getLocation(options);
    },
    chooseImage: (options) => {
            my.chooseImage(options);
    },
    setStorage: (options) => {
        if (isMyDefined) {
            my.setStorage(options);
        } else {
            alert('Mock my.setStorage:'+ options);
            localStorage.setItem(options.key, JSON.stringify(options.data));
            if (options.success) options.success();
        }
    },
    getStorage: (options) => {
        if (isMyDefined) {
            my.getStorage(options);
        } else {
            alert('Mock my.getStorage:'+ options);
            const data = localStorage.getItem(options.key);
            if (options.success) {
                options.success({ data: data ? JSON.parse(data) : null });
            }
        }
    },
    alert: (options) => {
            my.alert(options);
    },
    showActionSheet: (options) => {
            my.showActionSheet(options);
    },
    makePhoneCall: (options) => {
            my.makePhoneCall(options);
    },
    openLocation: (options) => {
        my.openLocation(options);
    },
    vibrateShort: (options) => {
            my.vibrate(options);
    },
    setClipboard: (options) => {
            my.setClipboard(options);
    },
    getNetworkType: (options) => {
            my.getNetworkType(options);
    },
    chooseVideo: (options) => {
            my.chooseVideo(options);
    },
    setNavigationBar: (options) => {
            my.setNavigationBar(options);
    },
    previewImage: (options) => {
            my.previewImage(options);
    }
};
