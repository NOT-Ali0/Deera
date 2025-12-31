<script>
    import { createEventDispatcher } from "svelte";
    import { qi } from "../lib/qi.js";

    const dispatch = createEventDispatcher();

    // Prop from App.svelte
    export let product = {};

    // Computed
    $: displayImages =
        product.images && product.images.length > 0
            ? product.images
            : [product.image || "https://placehold.co/300"];

    function handleBack() {
        dispatch("back");
    }

    function handleShare() {
        const shareText = `Check out this ${product.name} for ${product.price}!`;
        qi.setClipboard({
            text: shareText,
            success: () => {
                qi.showToast({ content: "Link copied!", type: "success" });
            },
        });
    }

    function handlePreview(index) {
        qi.previewImage({
            urls: displayImages,
            current: index,
        });
    }

    function handleContact() {
        qi.showActionSheet({
            items: ["Call Seller", "Show on Map", "Save to Favorites"],
            success: (res) => {
                const index = res.index;
                if (index === 0) {
                    // Call
                    qi.makePhoneCall({ number: "+974 5555 1234" });
                } else if (index === 1) {
                    // Map

                    qi.openLocation({
                        longitude: product.lng,
                        latitude: product.lat,
                        name: "iraq",
                        address: "baghdad",
                    });
                } else if (index === 2) {
                    // Favorites
                    qi.vibrateShort();
                    qi.showToast({
                        content: "Added to Favorites",
                        type: "success",
                    });
                }
            },
        });
    }

    function handleDelete() {
        if (typeof my !== "undefined") {
            my.confirm({
                title: "حذف المنتج",
                content: "هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟",
                confirmButtonText: "نعم، احذف",
                cancelButtonText: "إلغاء",
                success: () => {
                    my.vibrate();
                    performDelete();
                },
            });
        }
    }

    function performDelete() {
        qi.getStorage({
            key: "products",
            success: (res) => {
                const products = res.data || [];
                const updated = products.filter((p) => p.id !== product.id);
                qi.setStorage({
                    key: "products",
                    data: updated,
                    success: () => {
                        qi.showToast({
                            content: "تم الحذف بنجاح",
                            type: "success",
                        });
                        setTimeout(() => {
                            dispatch("back");
                        }, 500);
                    },
                    fail: (err) => {
                        my.alert({
                            title: "فشل الحذف",
                            content: "فشل حذف المنتج، حاول مرة أخرى" + err,
                        });
                    },
                });
            },
        });
    }
</script>

<div class="container">
    <div class="header">
        <button class="back-btn" onclick={handleBack}>←</button>
        <button class="share-btn" onclick={handleShare}>🔗</button>
    </div>

    <!-- Image Swiper -->
    <div class="swiper-container">
        {#each displayImages as img, i}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <img
                src={img}
                alt={product.name}
                class="slide-image"
                onclick={() => handlePreview(i)}
            />
        {/each}
        <div class="badge">{displayImages.length} Photos</div>
    </div>

    <div class="content">
        <div class="title-row">
            <h1>{product.name}</h1>
            <span class="category-tag">{product.category || "General"}</span>
        </div>

        <p class="price">{product.price}</p>

        {#if product.description}
            <p class="description">{product.description}</p>
        {/if}

        {#if product.video}
            <div class="video-section">
                <h3>Video Tour</h3>
                <!-- svelte-ignore a11y_media_has_caption -->
                <video
                    src={product.video}
                    controls
                    class="video-player"
                    poster={displayImages[0]}
                ></video>
            </div>
        {/if}

        <div class="actions">
            <button class="contact-btn" onclick={handleContact}>
                Contact Seller
            </button>
            <button class="delete-full-width-btn" onclick={handleDelete}>
                Delete Product
            </button>
        </div>
    </div>
</div>

<style>
    .container {
        background: #fff;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .header {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        z-index: 10;
        pointer-events: none; /* Let clicks pass through except buttons */
    }

    .back-btn,
    .share-btn {
        pointer-events: auto;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Swiper Styles */
    .swiper-container {
        width: 100%;
        height: 350px;
        background: #f0f0f0;
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        position: relative;
    }

    .swiper-container::-webkit-scrollbar {
        display: none; /* Hide scrollbar */
    }

    .slide-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        flex-shrink: 0;
        scroll-snap-align: start;
    }

    .badge {
        position: absolute;
        bottom: 16px;
        right: 16px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
    }

    .content {
        padding: 24px;
        flex: 1;
        border-top-left-radius: 24px;
        border-top-right-radius: 24px;
        background: white;
        margin-top: -24px;
        position: relative;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
        z-index: 5;
    }

    .title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }

    h1 {
        margin: 0;
        font-size: 1.8rem;
        color: #333;
        flex: 1;
    }

    .category-tag {
        background: #e0f2f1;
        color: #00796b;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
        margin-left: 8px;
    }

    .price {
        font-size: 1.5rem;
        font-weight: bold;
        color: #2e7d32;
        margin: 8px 0 16px 0;
    }

    .description {
        color: #666;
        line-height: 1.5;
        margin-bottom: 24px;
    }

    .video-section {
        margin-top: 24px;
        margin-bottom: 24px;
    }

    .video-section h3 {
        margin: 0 0 12px 0;
        font-size: 1.1rem;
        color: #333;
    }

    .video-player {
        width: 100%;
        border-radius: 12px;
        background: #000;
        max-height: 250px;
    }

    .actions {
        margin-top: auto;
        padding-top: 16px;
    }

    .contact-btn {
        width: 100%;
        background: #007bff;
        color: white;
        border: none;
        padding: 16px;
        font-size: 1.1rem;
        font-weight: bold;
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .contact-btn:active {
        background: #0056b3;
        transform: scale(0.98);
    }

    .delete-full-width-btn {
        width: 100%;
        background: #ffebee;
        color: #d32f2f;
        border: 1px solid #ffcdd2;
        padding: 16px;
        font-size: 1.1rem;
        font-weight: bold;
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.2s;
        margin-top: 12px;
    }

    .delete-full-width-btn:active {
        background: #ffcdd2;
        transform: scale(0.98);
    }
</style>
