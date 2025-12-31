
/**
 * Safe wrapper for Qi Mini App 'my' global object.
 * Prevents errors in non-MiniApp environments (like standard browsers during dev).
 */

const isMyDefined = typeof my !== 'undefined';

export const qi = {
    redirectTo: (options) => {
        if (isMyDefined) {
            my.redirectTo(options);
        } else {
            console.log('Mock my.redirectTo:', options);
        }
    },
    showToast: (options) => {
        if (isMyDefined) {
            my.showToast(options);
        } else {
            console.log('Mock my.showToast:', options);
            alert(`Toast: ${options.content}`);
        }
    },
    showLoading: (options) => {
        if (isMyDefined) {
            my.showLoading(options);
        } else {
            console.log('Mock my.showLoading:', options);
        }
    },
    hideLoading: () => {
        if (isMyDefined) {
            my.hideLoading();
        } else {
            console.log('Mock my.hideLoading');
        }
    },
    getLocation: (options) => {
        if (isMyDefined) {
            my.getLocation(options);
        } else {
            console.log('Mock my.getLocation');
            // Mock success callback
            if (options.success) {
                options.success({ latitude: 0, longitude: 0 });
            }
        }
    },
    chooseImage: (options) => {
        if (isMyDefined) {
            my.chooseImage(options);
        } else {
            console.log('Mock my.chooseImage:', options);
            // Mock success callback
            if (options.success) {
                options.success({ apFilePaths: ['mock_image_path.png'] });
            }
        }
    },
    request: (options) => {
        if (isMyDefined) {
            my.request(options);
        } else {
            console.log('Mock my.request:', options);
        }
    },
    setStorage: (options) => {
        if (isMyDefined) {
            my.setStorage(options);
        } else {
            console.log('Mock my.setStorage:', options);
            localStorage.setItem(options.key, JSON.stringify(options.data));
            if (options.success) options.success();
        }
    },
    getStorage: (options) => {
        if (isMyDefined) {
            my.getStorage(options);
        } else {
            console.log('Mock my.getStorage:', options);
            const data = localStorage.getItem(options.key);
            if (options.success) {
                options.success({ data: data ? JSON.parse(data) : null });
            }
        }
    },
    alert: (options) => {
        if (isMyDefined) {
            my.alert(options);
        } else {
            alert(options.content);
        }
    },
    // Navigation Helpers (Mock only)
    _navCallback: null,
    onNavigate: (cb) => {
        qi._navCallback = cb;
    },
    navigateTo: (options) => {
        if (isMyDefined) {
            my.navigateTo(options);
        } else {
            console.log('Mock my.navigateTo:', options);
            if (qi._navCallback) qi._navCallback(options.url);
        }
    },
    navigateBack: () => {
        if (isMyDefined) {
            my.navigateBack();
        } else {
            console.log('Mock my.navigateBack');
            if (qi._navCallback) qi._navCallback('back');
        }
    },
    // New System Features
    showActionSheet: (options) => {
        if (isMyDefined) {
            my.showActionSheet(options);
        } else {
            console.log('Mock my.showActionSheet:', options);
            // Mocking via prompt for dev simplicity
            const items = options.items.map((item, idx) => `${idx}: ${item}`).join('\n');
            const result = prompt(`Choose an option:\n${items}`);
            if (result !== null && options.success) {
                options.success({ index: parseInt(result, 10) });
            }
        }
    },
    makePhoneCall: (options) => {
        if (isMyDefined) {
            my.makePhoneCall(options);
        } else {
            console.log('Mock my.makePhoneCall:', options);
            alert(`Calling ${options.number}...`);
        }
    },
    openLocation: (options) => {
        if (isMyDefined) {
            my.openLocation(options);
        } else {
            console.log('Mock my.openLocation:', options);
            window.open(`https://maps.google.com/?q=${options.latitude},${options.longitude}`);
        }
    },
    vibrateShort: (options) => {
        if (isMyDefined) {
            my.vibrate(options);
        } else {
            console.log('Mock my.vibrateShort');
            // Navigator vibrate if available
            if (navigator.vibrate) navigator.vibrate(50);
        }
    },
    setClipboard: (options) => {
        if (isMyDefined) {
            my.setClipboard(options);
        } else {
            console.log('Mock my.setClipboard:', options);
            if (navigator.clipboard) {
                navigator.clipboard.writeText(options.text).then(() => {
                    if (options.success) options.success();
                });
            } else {
                if (options.success) options.success();
            }
        }
    },
    getNetworkType: (options) => {
        if (isMyDefined) {
            my.getNetworkType(options);
        } else {
            console.log('Mock my.getNetworkType');
            const type = navigator.onLine ? 'wifi' : 'none';
            if (options.success) options.success({ networkType: type });
        }
    },
    chooseVideo: (options) => {
        if (isMyDefined) {
            my.chooseVideo(options);
        } else {
            console.log('Mock my.chooseVideo:', options);
            // Mock success
            if (options.success) {
                options.success({ apFilePath: 'https://www.w3schools.com/html/mov_bbb.mp4' });
            }
        }
    },
    previewImage: (options) => {
        if (isMyDefined) {
            my.previewImage(options);
        } else {
            console.log('Mock my.previewImage:', options);
            // In browser, maybe open the first image in a new tab?
            if (options.urls && options.urls.length > 0) {
                window.open(options.urls[parseInt(options.current || 0)]);
            }
        }
    }
};
