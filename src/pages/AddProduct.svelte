<script>
    import { createEventDispatcher } from "svelte";
    import { qi } from "../lib/qi.js";

    const dispatch = createEventDispatcher();

    // Form Data
    let name = "";
    let price = "";
    let description = "";
    let category = "Select Category";
    let images = [];
    let video = "";

    function handleCategory() {
        const categories = ["Electronics", "Furniture", "Clothing"];
        qi.showActionSheet({
            items: categories,
            success: (res) => {
                category = categories[res.index];
            },
        });
    }

    function handleAddImages() {
        if (typeof my === "undefined") {
            // Mock environment - proceed directly
            qi.chooseImage({
                count: 5 - images.length,
                success: (res) => {
                    const newPaths = res.apFilePaths;
                    images = [...images, ...newPaths];
                },
            });
            return;
        }

        // Check album permission first
        my.getSetting({
            success: (res) => {
                const authSetting = res.authSetting || {};
                if (authSetting["scope.album"] === false) {
                    // Permission denied - guide to settings
                    qi.showToast({
                        content: "يرجى تفعيل صلاحية الألبوم من الإعدادات",
                        type: "none",
                    });
                    my.showAuthGuide({
                        authCode: "ALBUM",
                    });
                } else {
                    qi.chooseImage({
                        count: 5 - images.length,
                        success: (res) => {
                            const newPaths = res.apFilePaths;
                            images = [...images, ...newPaths];
                        },
                    });
                }
            },
            fail: (err) => {
                console.error("getSetting failed:", err);
                // Attempt to proceed anyway
                qi.chooseImage({
                    count: 5 - images.length,
                    success: (res) => {
                        const newPaths = res.apFilePaths;
                        images = [...images, ...newPaths];
                    },
                });
            },
        });
    }

    function handlePreviewImage(index) {
        qi.previewImage({
            urls: images,
            current: index,
        });
    }

    function handleRemoveImage(index) {
        images = images.filter((_, i) => i !== index);
    }

    function handleAddVideo() {
        qi.showLoading({ content: "Init Video..." });

        if (typeof my === "undefined") {
            qi.chooseVideo({
                success: (res) => {
                    video = res.tempFilePath;
                    qi.hideLoading();
                },
            });
            return;
        }

        // Check camera permission first
        my.getSetting({
            success: (res) => {
                console.log("Settings:", JSON.stringify(res));
                const authSetting = res.authSetting || {};

                if (authSetting["scope.camera"] === false) {
                    // Permission denied - guide to settings
                    qi.hideLoading();
                    qi.showToast({
                        content:
                            "يرجى تفعيل صلاحية الكاميرا من الإعدادات لنتمكن من رفع الفيديو",
                        type: "none",
                    });
                    my.showAuthGuide({
                        authCode: "CAMERA",
                    });
                } else {
                    // Permission granted - proceed with video selection
                    chooseVideoNative();
                }
            },
            fail: (err) => {
                console.error("getSetting failed:", JSON.stringify(err));
                // Attempt anyway - the system might prompt for permission
                chooseVideoNative();
            },
        });
    }

    function chooseVideoNative() {
        try {
            my.chooseVideo({
                sourceType: ["album", "camera"],
                compressed: true,
                maxDuration: 60,
                camera: "back",
                success: (res) => {
                    video = res.tempFilePath;
                    qi.hideLoading();
                },
                fail: (err) => {
                    qi.hideLoading();
                    my.alert({
                        title: "Selection Failed",
                        content: JSON.stringify(err),
                    });
                },
            });
        } catch (e) {
            qi.hideLoading();
            my.alert({ title: "Error", content: e.message });
        }
    }

    function handleRemoveVideo() {
        video = "";
    }

    function handleSubmit() {
        if (!name || !price || !description || category === "Select Category") {
            qi.showToast({ content: "Please fill all fields", type: "none" });
            return;
        }

        qi.showLoading({ content: "Publishing..." });

        // Get Location for Geo-tagging
        qi.getLocation({
            success: (location) => {
                my.alert({
                    title: "Selection success",
                    content: JSON.stringify(location),
                });
                const newProduct = {
                    id: Date.now(),
                    name,
                    price,
                    description,
                    category,
                    images, // Array of paths
                    image: images.length > 0 ? images[0] : "", // Main thumb for legacy support
                    video,
                    lat: location.latitude,
                    lng: location.longitude,
                    date: new Date().toISOString(),
                };

                saveProduct(newProduct);
            },
            fail: (err) => {
                my.alert({
                    title: "Selection Failed",
                    content: JSON.stringify(err),
                });
                qi.hideLoading();
                qi.showToast({ content: "Location failed", type: "fail" });
            },
        });
    }

    function saveProduct(product) {
        qi.getStorage({
            key: "products",
            success: (res) => {
                const products = res.data || [];
                const updatedProducts = [product, ...products];

                qi.setStorage({
                    key: "products",
                    data: updatedProducts,
                    success: () => {
                        qi.hideLoading();
                        qi.showToast({
                            content: "Published!",
                            type: "success",
                        });
                        // Delay to show toast then navigate
                        setTimeout(() => {
                            dispatch("success");
                        }, 1000);
                    },
                });
            },
        });
    }

    function handleCancel() {
        dispatch("cancel");
    }
</script>

<div class="add-container">
    <h2>Post New Ad</h2>

    <div class="form-group">
        <label>Product Name</label>
        <input type="text" bind:value={name} placeholder="e.g. iPhone 14 Pro" />
    </div>

    <div class="form-group">
        <label>Price</label>
        <input type="text" bind:value={price} placeholder="e.g. 3500 QAR" />
    </div>

    <div class="form-group">
        <label>Category</label>
        <div class="selector" onclick={handleCategory}>
            {category} <span class="arrow">▼</span>
        </div>
    </div>

    <div class="form-group">
        <label>Description</label>
        <textarea
            bind:value={description}
            rows="4"
            placeholder="Describe your item..."
        ></textarea>
    </div>

    <div class="media-section">
        <label>Photos ({images.length}/5)</label>
        <div class="media-grid">
            {#each images as img, i}
                <div class="media-item">
                    <img
                        src={img}
                        alt="thumb"
                        onclick={() => handlePreviewImage(i)}
                    />
                    <button
                        class="remove-btn"
                        onclick={() => handleRemoveImage(i)}>×</button
                    >
                </div>
            {/each}
            {#if images.length < 5}
                <button class="add-media-btn" onclick={handleAddImages}>
                    <span>+</span> Photo
                </button>
            {/if}
        </div>
    </div>

    <div class="media-section">
        <label>Video</label>
        <div class="media-grid">
            {#if video}
                <div class="media-item video-item">
                    <div class="video-icon">▶</div>
                    <button class="remove-btn" onclick={handleRemoveVideo}
                        >×</button
                    >
                </div>
            {:else}
                <button class="add-media-btn" onclick={handleAddVideo}>
                    <span>+</span> Video
                </button>
            {/if}
        </div>
    </div>

    <div class="actions">
        <button class="btn cancel" onclick={handleCancel}>Cancel</button>
        <button class="btn submit" onclick={handleSubmit}>Publish Now</button>
    </div>
</div>

<style>
    .add-container {
        padding: 20px;
        background: #fff;
        min-height: 100vh;
        padding-bottom: 40px;
    }

    h2 {
        text-align: center;
        margin-bottom: 24px;
        color: #333;
    }

    .form-group {
        margin-bottom: 20px;
    }

    label {
        display: block;
        font-weight: bold;
        margin-bottom: 8px;
        color: #555;
        font-size: 0.9rem;
    }

    input,
    textarea,
    .selector {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        background: #fafafa;
        box-sizing: border-box;
    }

    .selector {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        color: #333;
    }

    .media-section {
        margin-bottom: 24px;
    }

    .media-grid {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding-bottom: 8px;
    }

    .media-item {
        position: relative;
        width: 80px;
        height: 80px;
        flex-shrink: 0;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #eee;
    }

    .media-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .video-item {
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .video-icon {
        color: white;
        font-size: 1.5rem;
    }

    .remove-btn {
        position: absolute;
        top: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 12px;
        border-bottom-left-radius: 4px;
    }

    .add-media-btn {
        width: 80px;
        height: 80px;
        border: 2px dashed #ddd;
        border-radius: 8px;
        background: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #888;
        cursor: pointer;
        flex-shrink: 0;
    }

    .add-media-btn span {
        font-size: 1.5rem;
        margin-bottom: 4px;
    }

    .actions {
        display: flex;
        gap: 16px;
        margin-top: 32px;
    }

    .btn {
        flex: 1;
        padding: 14px;
        border: none;
        border-radius: 25px;
        font-weight: bold;
        font-size: 1rem;
        cursor: pointer;
    }

    .cancel {
        background: #f0f0f0;
        color: #555;
    }

    .submit {
        background: #007bff;
        color: white;
        box-shadow: 0 4px 6px rgba(0, 123, 255, 0.2);
    }
</style>
