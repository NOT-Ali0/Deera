<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { qi } from "../lib/qi.js";
    import { UserToken } from "../lib/UserInfo.js";
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

    function handleOpenMap() {
        // Check if location data is available
        if (!product.lat || !product.lng) {
            qi.showToast({
                content: "الموقع غير متوفر",
                type: "none",
            });
            return;
        }

        // Construct Google Maps URL
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${product.lat},${product.lng}`;

        // Try to open with my.navigateTo if available
        if (typeof my !== "undefined" && my.navigateTo) {
            my.navigateTo({
                url: mapsUrl,
                success: () => {
                    qi.vibrateShort();
                },
                fail: () => {
                    // Fallback: copy URL to clipboard
                    qi.setClipboard({
                        text: mapsUrl,
                        success: () => {
                            qi.showToast({
                                content: "تم نسخ رابط الخريطة",
                                type: "success",
                            });
                        },
                    });
                },
            });
        } else {
            // Fallback for environments without my.navigateTo
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
    }

    function handleContact() {
        qi.showActionSheet({
            items: ["Call Seller", "Save to Favorites"],
            success: (res) => {
                const index = res.index;
                if (index === 0) {
                    // Call seller using their phone number
                    // const phoneNumber = product.sellerPhone || "+974 5555 1234";
                    my.getStorage({
                        key: "userToken",
                        success: (res) => {
                            const userToken = res.data;
                            let phoneNumber = userToken.phoneNumber;
                            qi.makePhoneCall({ number: phoneNumber });
                        },
                    });
                } else if (index === 1) {
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

    function handlePay() {
        fetch("https://its.mouamle.space/api/payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${$UserToken.token}`,
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
            <button class="map-btn" onclick={handleOpenMap}>
                📍 عرض الموقع على الخريطة
            </button>
            <button class="pay-btn" onclick={handlePay}> Pay Now </button>
            <button class="delete-full-width-btn" onclick={handleDelete}>
                Delete Product
            </button>
        </div>
    </div>
</div>

<style>
    .container {
        background: var(--surface);
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    /* Swiper Styles */
    .swiper-container {
        width: 100%;
        height: 350px;
        background: var(--background);
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
        bottom: var(--spacing-md);
        right: var(--spacing-md);
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        color: white;
        padding: 6px 12px;
        border-radius: var(--radius-sm);
        font-size: 0.85rem;
        font-weight: 600;
    }

    .content {
        padding: var(--spacing-lg);
        flex: 1;
        border-top-left-radius: var(--radius-xl);
        border-top-right-radius: var(--radius-xl);
        background: var(--surface);
        margin-top: -24px;
        position: relative;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
        z-index: 5;
    }

    .title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--spacing-md);
    }

    h1 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-primary);
        flex: 1;
        line-height: 1.3;
    }

    .category-tag {
        background: var(--success-light);
        color: var(--success-color);
        padding: 6px 12px;
        border-radius: var(--radius-sm);
        font-size: 0.8rem;
        font-weight: 700;
        white-space: nowrap;
    }

    .price {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--success-color);
        margin: var(--spacing-sm) 0 var(--spacing-md) 0;
    }

    .description {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: var(--spacing-lg);
        font-size: 1rem;
    }

    .video-section {
        margin-top: var(--spacing-lg);
        margin-bottom: var(--spacing-lg);
    }

    .video-section h3 {
        margin: 0 0 var(--spacing-md) 0;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .video-player {
        width: 100%;
        border-radius: var(--radius-md);
        background: #000;
        max-height: 250px;
    }

    .actions {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        max-width: 600px;
        margin: 0 auto;
        padding: var(--spacing-md);
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
        z-index: 100;
    }

    .contact-btn {
        width: 100%;
        background: linear-gradient(
            135deg,
            var(--primary-color) 0%,
            var(--primary-dark) 100%
        );
        color: white;
        border: none;
        padding: 16px;
        font-size: 1.1rem;
        font-weight: 700;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-normal);
        box-shadow: var(--shadow-md);
        letter-spacing: 0.3px;
    }

    .contact-btn:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
    }

    .contact-btn:active {
        transform: scale(0.95);
    }

    .map-btn {
        width: 100%;
        background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
        color: white;
        border: none;
        padding: 16px;
        font-size: 1.1rem;
        font-weight: 700;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-normal);
        box-shadow: var(--shadow-md);
        letter-spacing: 0.3px;
        margin-top: var(--spacing-md);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
    }

    .map-btn:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
    }

    .map-btn:active {
        transform: scale(0.95);
    }

    .pay-btn {
        background-color: #28a745;
        color: white;
        text-align: center;
        font-size: 16px;
        padding: 14px;
        border: none;
        border-radius: 8px;
        width: 100%;
        cursor: pointer;
        margin-top: 10px;
        font-weight: bold;
        transition: opacity 0.2s;
    }

    .pay-btn:active {
        opacity: 0.8;
    }

    .delete-full-width-btn {
        width: 100%;
        background: var(--danger-light);
        color: var(--danger-color);
        border: 1px solid rgba(211, 47, 47, 0.2);
        padding: 16px;
        font-size: 1.1rem;
        font-weight: 700;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-normal);
        margin-top: var(--spacing-md);
    }

    .delete-full-width-btn:hover {
        background: #ffcdd2;
    }

    .delete-full-width-btn:active {
        transform: scale(0.95);
    }
</style>
