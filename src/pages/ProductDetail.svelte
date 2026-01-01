<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { qi } from "../lib/qi.js";
    import { formatNumber, CURRENCY_SYMBOL } from "../lib/utils.js";
    const dispatch = createEventDispatcher();

    // Prop from App.svelte
    export let product = {};

    // Computed
    $: displayImages =
        product.images && product.images.length > 0
            ? product.images
            : [product.image || "https://placehold.co/300"];

    onMount(() => {
        qi.setNavigationBar({
            title: "تفاصيل المنتج",
        });
    });

    function closeDetail() {
        dispatch("back");
    }

    function handlePreview(index) {
        qi.previewImage({
            urls: displayImages,
            current: index,
        });
    }

    function handleOpenMap() {
        if (!product.lat || !product.lng) {
            qi.showToast({
                content: "الموقع غير متوفر",
                type: "none",
            });
            return;
        }

        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${product.lat},${product.lng}`;
        qi.setClipboard({
            text: mapsUrl,
            success: () => {
                qi.showToast({
                    content: "تم نسخ رابط الخريطة، افتحه في المتصفح",
                    type: "success",
                });
            },
        });
    }

    function handleContact() {
        qi.showActionSheet({
            items: ["Call Seller", "Save to Favorites"],
            success: (res) => {
                const index = res.index;
                if (index === 0) {
                    my.getStorage({
                        key: "userToken",
                        success: (res) => {
                            const userToken = res.data;
                            let phoneNumber = userToken.phoneNumber;
                            qi.makePhoneCall({ number: phoneNumber });
                        },
                    });
                }
                // else if (index === 1) {
                //     qi.vibrateShort();
                //     qi.showToast({
                //         content: "Added to Favorites",
                //         type: "success",
                //     });
                // }
            },
        });
    }

    function handlePay() {
        fetch("https://its.mouamle.space/api/payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${localStorage.getItem("token")}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                my.tradePay({
                    paymentUrl: data.url,
                    success: (res) => {
                        qi.showToast({
                            content: "Payment successful",
                            type: "success",
                        });
                    },
                    fail: (err) => {
                        qi.showToast({
                            content:
                                "Payment failed trade" + JSON.stringify(err),
                            type: "none",
                        });
                    },
                });
            })
            .catch((err) => {
                qi.showToast({
                    content: "Payment failed" + err,
                });
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
    <!-- Manual Back Button -->
    <button class="manual-back-btn" onclick={closeDetail}>
        <span class="icon">←</span>
        <span class="text">رجوع</span>
    </button>

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
        <!-- <div class="badge">{displayImages.length} Photos</div> -->
    </div>

    <div class="content">
        <div class="title-row">
            <h1>{product.name}</h1>
            <span class="category-tag">{product.category || "General"}</span>
        </div>

        <div class="price-container">
            {#if product.oldPrice && parseFloat(product.oldPrice) > parseFloat(product.price)}
                <span class="old-price">
                    {formatNumber(product.oldPrice)}
                    <small>{CURRENCY_SYMBOL}</small>
                </span>
            {/if}
            <p class="price">
                {formatNumber(product.price)}
                <span class="currency">{CURRENCY_SYMBOL}</span>
            </p>
        </div>

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

        <!-- Secondary Actions in Content Area -->
        <div class="secondary-actions">
            <button class="contact-btn" onclick={handleContact}>
                تواصل مع البائع
            </button>
            <button class="delete-btn" onclick={handleDelete}>
                حذف المنتج
            </button>
        </div>
    </div>

    <!-- Fixed Bottom Bar -->
    <footer class="bottom-bar">
        <!-- Secondary Button: Map -->
        <button class="map-btn-square" onclick={handleOpenMap} title="الموقع">
            <span class="btn-icon">📍</span>
            <span class="btn-text-short">الموقع</span>
        </button>

        <!-- Primary Button: Pay -->
        <button class="pay-btn-primary" onclick={handlePay}>
            الدفع الآن
        </button>
    </footer>
</div>

<style>
    .container {
        background: var(--surface);
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        position: relative;
        padding-bottom: 100px; /* Space for fixed bottom bar */
    }

    /* Manual Back Button */
    .manual-back-btn {
        position: absolute;
        top: 16px;
        left: 16px;
        z-index: 100;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: none;
        padding: 8px 16px;
        border-radius: 100px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;
    }

    .manual-back-btn:active {
        transform: scale(0.95);
        background: rgba(255, 255, 255, 0.95);
    }

    .manual-back-btn .icon {
        font-size: 1.2rem;
        line-height: 1;
        color: var(--text-primary);
        margin-top: -2px; /* Visual tweak */
    }

    .manual-back-btn .text {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    /* Swiper Styles */
    .swiper-container {
        width: 100%;
        height: 380px;
        background: var(--background);
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        position: relative;
    }

    .swiper-container::-webkit-scrollbar {
        display: none;
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
        bottom: 30px;
        right: var(--spacing-md);
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        color: white;
        padding: 6px 14px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 600;
        z-index: 6;
    }

    .content {
        padding: var(--spacing-lg);
        flex: 1;
        border-top-left-radius: 24px;
        border-top-right-radius: 24px;
        background: var(--surface);
        margin-top: -24px;
        position: relative;
        box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.05);
        z-index: 5;
    }

    .title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-sm);
    }

    h1 {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--text-primary);
        flex: 1;
        line-height: 1.2;
    }

    .category-tag {
        background: var(--primary-light);
        color: var(--primary-color);
        padding: 6px 12px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 700;
        white-space: nowrap;
    }

    .price-container {
        display: flex;
        align-items: baseline;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-lg);
    }

    .price {
        font-size: 1.8rem;
        font-weight: 800;
        color: #27ae60;
        margin: 0;
    }

    .currency {
        font-size: 1rem;
        font-weight: 700;
        margin-left: 2px;
    }

    .old-price {
        font-size: 1.1rem;
        color: var(--text-muted);
        text-decoration: line-through;
        font-weight: 500;
    }

    .description {
        color: var(--text-secondary);
        line-height: 1.7;
        margin-bottom: var(--spacing-xl);
        font-size: 1.05rem;
    }

    .video-section {
        margin-bottom: var(--spacing-xl);
    }

    .video-section h3 {
        margin: 0 0 var(--spacing-md) 0;
        font-size: 1.2rem;
        font-weight: 700;
    }

    .video-player {
        width: 100%;
        border-radius: 16px;
        background: #000;
        aspect-ratio: 16/9;
        object-fit: cover;
    }

    /* Secondary Actions in Content */
    .secondary-actions {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        margin-top: var(--spacing-lg);
    }

    .contact-btn,
    .delete-btn {
        width: 100%;
        padding: 16px;
        border-radius: 16px;
        font-weight: 700;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }

    .contact-btn {
        background: var(--primary-light);
        color: var(--primary-color);
    }

    .delete-btn {
        background: var(--danger-light);
        color: var(--danger-color);
    }

    .contact-btn:active,
    .delete-btn:active {
        transform: scale(0.98);
    }

    /* Fixed Bottom Bar */
    .bottom-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        max-width: 600px;
        margin: 0 auto;
        padding: 16px 20px 30px 20px; /* Extra bottom padding for safe area */
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        gap: 16px;
        z-index: 1000;
        box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.08);
    }

    /* Pay Button (Primary) */
    .pay-btn-primary {
        flex: 0 0 70%;
        background: linear-gradient(
            135deg,
            var(--primary-color) 0%,
            var(--primary-dark) 100%
        );
        color: white;
        border: none;
        padding: 18px;
        font-size: 1.2rem;
        font-weight: 800;
        border-radius: 16px;
        box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
        cursor: pointer;
        transition: transform 0.2s;
    }

    .pay-btn-primary:active {
        transform: scale(0.95);
    }

    /* Map Button (Secondary) */
    .map-btn-square {
        flex: 1;
        background: #f0f0f0; /* Light Gray */
        color: var(--text-primary);
        border: none;
        height: 60px;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition:
            transform 0.2s,
            background-color 0.2s;
        gap: 2px;
    }

    .map-btn-square:active {
        transform: scale(0.95);
        background-color: #e5e5e5;
    }

    .btn-icon {
        font-size: 1.4rem;
    }

    .btn-text-short {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-secondary);
    }

    /* General interactions */
    button:active {
        transform: scale(0.95);
    }
</style>
