<script>
    import { qi } from "../lib/qi.js";
    let { userToken = null, onsuccess, oncancel } = $props();

    let name = $state("");
    let price = $state("");
    let description = $state("");
    let category = $state("اختر الفئة");
    let governorate = $state("اختر المحافظة");
    let images = $state([]);
    let video = $state("");

    const categories = ["إلكترونيات", "أثاث", "ملابس", "أخرى"];
    const governorates = [
        "بغداد",
        "البصرة",
        "نينوى",
        "أربيل",
        "النجف",
        "ذي قار",
        "كركوك",
        "بابل",
        "كربلاء",
        "السليمانية",
        "الأنبار",
        "ميسان",
        "دهوك",
        "المثنى",
        "صلاح الدين",
        "واسط",
        "القادسية",
        "ديالى",
    ];

    function handleCategory() {
        qi.showActionSheet({
            items: categories,
            success: (res) => {
                category = categories[res.index];
            },
        });
    }

    function handleGovernorate() {
        qi.showActionSheet({
            items: governorates,
            success: (res) => {
                governorate = governorates[res.index];
            },
        });
    }

    function handleAddImages() {
        if (typeof my === "undefined") {
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
                            images = [...images, ...res.apFilePaths];
                        },
                    });
                }
            },
            fail: (err) => {
                console.error("getSetting failed:", err);
                qi.chooseImage({
                    count: 5 - images.length,
                    success: (res) => {
                        images = [...images, ...res.apFilePaths];
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

    function chooseVideoNative() {
        qi.showToast({ content: "Coming soon...", type: "none" });
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
    }

    function handleRemoveVideo() {
        video = "";
    }

    function handleSubmit() {
        if (
            !name ||
            !price ||
            !description ||
            category === "اختر الفئة" ||
            governorate === "اختر المحافظة"
        ) {
            qi.showToast({ content: "يرجى ملء جميع الحقول", type: "none" });
            return;
        }

        qi.showLoading({ content: "جاري النشر..." });

        // Get Location
        qi.getLocation({
            success: (location) => {
                const newProduct = {
                    id: Date.now(),
                    name,
                    price,
                    description,
                    category,
                    governorate,
                    images: [...images], // Array of paths
                    image: images.length > 0 ? images[0] : "",
                    video,
                    lat: location.latitude,
                    lng: location.longitude,
                    date: new Date().toISOString(),
                    sellerPhone: userToken?.phoneNumber || "",
                    sellerName: userToken?.fullName || "مجهول",
                };

                saveProduct(newProduct);
            },
            fail: (err) => {
                my.alert({
                    title: "فشل الحصول على الموقع",
                    content: JSON.stringify(err),
                });
                qi.hideLoading();
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
                            content: "تم النشر بنجاح!",
                            type: "success",
                        });
                        // Delay to show toast then navigate
                        setTimeout(() => {
                            if (onsuccess) onsuccess();
                        }, 500);
                    },
                });
            },
        });
    }

    function handleCancel() {
        if (oncancel) oncancel();
    }
</script>

<div class="add-container">
    <h2>إضافة إعلان جديد</h2>

    <div class="form-group">
        <label for="product-name">اسم المنتج</label>
        <input
            id="product-name"
            type="text"
            bind:value={name}
            placeholder="مثال: آيفون 14 برو"
        />
    </div>

    <div class="form-group">
        <label for="sale-price">السعر (دينار عراقي)</label>
        <input
            id="sale-price"
            type="number"
            bind:value={price}
            placeholder="مثال: 25000"
        />
    </div>

    <div class="form-group">
        <label for="governorate-select">المحافظة</label>
        <button
            id="governorate-select"
            type="button"
            class="selector"
            onclick={handleGovernorate}
        >
            <span class="val">
                <span class="icon">📍</span>
                {governorate}
            </span>
            <span class="arrow">▼</span>
        </button>
    </div>

    <div class="form-group">
        <label for="category-select">الفئة</label>
        <button
            id="category-select"
            type="button"
            class="selector"
            onclick={handleCategory}
        >
            {category} <span class="arrow">▼</span>
        </button>
    </div>

    <div class="form-group">
        <label for="description">Description</label>
        <textarea
            id="description"
            bind:value={description}
            rows="4"
            placeholder="Describe your item..."
        ></textarea>
    </div>

    <div class="media-section">
        <label for="photos-input">الصور ({images.length}/5)</label>
        <div id="photos-input" class="media-grid">
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
        <label for="video-input">فيديو</label>
        <div id="video-input" class="media-grid">
            {#if video}
                <div class="media-item video-item">
                    <div class="video-icon">▶</div>
                    <button class="remove-btn" onclick={handleRemoveVideo}
                        >×</button
                    >
                </div>
            {:else}
                <button class="add-media-btn" onclick={chooseVideoNative}>
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
        padding: var(--spacing-lg);
        background: var(--surface);
        min-height: 100vh;
        padding-bottom: 40px;
    }

    h2 {
        text-align: center;
        margin-bottom: var(--spacing-lg);
        color: var(--text-primary);
        font-size: 1.75rem;
        font-weight: 700;
    }

    .form-group {
        margin-bottom: var(--spacing-lg);
    }

    label {
        display: block;
        font-weight: 700;
        margin-bottom: var(--spacing-sm);
        color: var(--text-primary);
        font-size: 0.95rem;
    }

    input,
    textarea,
    .selector {
        width: 100%;
        padding: 14px;
        border: 2px solid var(--border-color);
        border-radius: var(--radius-md);
        font-size: 1rem;
        background: var(--surface);
        box-sizing: border-box;
        transition: all var(--transition-fast);
        color: var(--text-primary);
        font-family: inherit;
    }

    input:focus,
    textarea:focus,
    .selector:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    .selector {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        color: var(--text-primary);
        background: var(--background);
        border: 2px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 14px;
        width: 100%;
        font-family: inherit;
        font-size: 1rem;
        transition: all var(--transition-fast);
        text-align: left;
    }

    .val {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .icon {
        font-size: 1.1rem;
    }

    .selector:hover {
        border-color: var(--primary-color);
    }

    .selector:active {
        transform: scale(0.99);
    }

    .arrow {
        color: var(--text-muted);
        font-size: 0.85rem;
    }

    .media-section {
        margin-bottom: var(--spacing-xl);
    }

    .media-grid {
        display: flex;
        gap: var(--spacing-md);
        overflow-x: auto;
        padding-bottom: var(--spacing-sm);
    }

    .media-item {
        position: relative;
        width: 90px;
        height: 90px;
        flex-shrink: 0;
        border-radius: var(--radius-md);
        overflow: hidden;
        border: 2px solid var(--border-color);
        box-shadow: var(--shadow-sm);
    }

    .media-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        cursor: pointer;
    }

    .video-item {
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .video-icon {
        color: white;
        font-size: 1.8rem;
    }

    .remove-btn {
        position: absolute;
        top: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        color: white;
        border: none;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
        border-bottom-left-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }

    .remove-btn:hover {
        background: rgba(0, 0, 0, 0.9);
    }

    .remove-btn:active {
        transform: scale(0.95);
    }

    .add-media-btn {
        width: 90px;
        height: 90px;
        border: 2px dashed var(--border-color);
        border-radius: var(--radius-md);
        background: var(--background);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        cursor: pointer;
        flex-shrink: 0;
        transition: all var(--transition-fast);
        font-weight: 600;
        font-size: 0.9rem;
    }

    .add-media-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: var(--primary-light);
    }

    .add-media-btn:active {
        transform: scale(0.95);
    }

    .add-media-btn span {
        font-size: 1.8rem;
        margin-bottom: var(--spacing-xs);
    }

    .actions {
        display: flex;
        gap: var(--spacing-md);
        margin-top: var(--spacing-xl);
    }

    .btn {
        flex: 1;
        padding: 16px;
        border: none;
        border-radius: var(--radius-md);
        font-weight: 700;
        font-size: 1.05rem;
        cursor: pointer;
        transition: all var(--transition-normal);
        letter-spacing: 0.3px;
    }

    .cancel {
        background: var(--background);
        color: var(--text-primary);
        border: 2px solid var(--border-color);
    }

    .cancel:hover {
        background: #e8e8e8;
    }

    .cancel:active {
        transform: scale(0.95);
    }

    .submit {
        background: linear-gradient(
            135deg,
            var(--primary-color) 0%,
            var(--primary-dark) 100%
        );
        color: white;
        box-shadow: var(--shadow-md);
    }

    .submit:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
    }

    .submit:active {
        transform: scale(0.95);
    }
</style>
