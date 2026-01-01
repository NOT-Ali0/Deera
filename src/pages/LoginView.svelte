<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { qi } from "../lib/qi.js";
    import { UserToken } from "../lib/UserInfo.js";
    const dispatch = createEventDispatcher();

    let fullName = "";
    let phoneNumber = "";
    let isLoading = false;

    onMount(() => {
        qi.setNavigationBar({
            title: "تسجيل الدخول",
        });
    });

    function handleSubmit() {
        // Validate inputs
        if (!fullName.trim() || !phoneNumber.trim()) {
            qi.showToast({
                content: "الرجاء إدخال الاسم ورقم الهاتف",
                type: "none",
            });
            return;
        }

        // Validate phone number format (basic check for Iraq numbers)
        if (phoneNumber.length !== 11 || !phoneNumber.startsWith("07")) {
            qi.showToast({
                content: "يرجى إدخال رقم هاتف صحيح (11 رقم يبدأ بـ 07)",
                type: "none",
            });
            return;
        }

        isLoading = true;
        qi.showLoading({ content: "جاري تسجيل الدخول..." });
            my.getAuthCode({
                scopes: ["auth_base", "USER_ID"],
                success: (res) => {
                    loginWithToken(res.authCode);
                    let Token = res.authCode;
                    fetch("https://its.mouamle.space/api/auth-with-superQi", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            token: Token,
                        }),
                    })
                        .then((res) => res.json())
                        .then((data) => {
                            UserToken.set({
                                token: data.token,
                            });
                        })
                        .catch((err) => {
                            my.alert({
                                content: "Login failed" + err,
                            });
                        });
                },
            });
        } 

    function loginWithToken(authCode) {
        const userToken = {
            authCode: authCode,
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim(),
            createdAt: new Date().toISOString(),
        };

        qi.setStorage({
            key: "userToken",
            data: userToken,
            success: () => {
                qi.hideLoading();
                qi.showToast({
                    content: "أهلاً بك، " + userToken.fullName,
                    type: "success",
                });
                setTimeout(() => {
                    dispatch("loginSuccess", userToken);
                }, 500);
            },
            fail: () => {
                qi.hideLoading();
                qi.showToast({ content: "فشل حفظ البيانات", type: "fail" });
                isLoading = false;
            },
        });
    }
</script>

<div class="login-page" in:fade={{ duration: 400 }}>
    <div class="login-card">
        <!-- Header Section -->
        <!-- Header Section -->

        <!-- Form Section -->

        <!-- Form Section -->
        <main class="form-container">
            <div class="input-group">
                <label for="fullName">الاسم الكامل</label>
                <div class="input-wrapper">
                    <input
                        id="fullName"
                        type="text"
                        bind:value={fullName}
                        placeholder="أدخل اسمك الكامل"
                        disabled={isLoading}
                        autocomplete="name"
                    />
                </div>
            </div>

            <div class="input-group">
                <label for="phoneNumber">رقم الهاتف</label>
                <div class="input-wrapper">
                    <input
                        id="phoneNumber"
                        type="tel"
                        bind:value={phoneNumber}
                        placeholder="07XXXXXXXXX"
                        disabled={isLoading}
                        autocomplete="tel"
                    />
                </div>
            </div>

            <button
                class="submit-btn"
                onclick={handleSubmit}
                disabled={isLoading}
            >
                {#if isLoading}
                    <span class="spinner"></span>
                    جاري التحميل...
                {:else}
                    تسجيل الدخول
                {/if}
            </button>
        </main>

        <!-- Footer Section -->
        <footer class="footer">
            <div class="secure-badge">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
            </div>
        </footer>
    </div>
</div>

<style>
    .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--background, #f5f7fa);
        padding: var(--spacing-lg, 24px);
    }

    .login-card {
        width: 100%;
        max-width: 400px;
        background: var(--surface, #ffffff);
        border-radius: 24px;
        padding: var(--spacing-xl, 32px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xl, 32px);
    }

    .form-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg, 24px);
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm, 8px);
    }

    .input-group label {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary, #1a1a1a);
        padding-right: 4px;
    }

    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .input-group input {
        width: 100%;
        padding: 14px 16px;
        background-color: #ffffff;
        border: 1.5px solid var(--border-color, #e0e0e0);
        border-radius: 12px;
        font-size: 1rem;
        transition: all var(--transition-fast, 150ms ease);
        color: var(--text-primary, #1a1a1a);
        direction: rtl;
    }

    .input-group input:focus {
        outline: none;
        border-color: var(--primary-color, #007bff);
        background-color: #fff;
        box-shadow: 0 0 0 4px var(--primary-light, rgba(0, 123, 255, 0.1));
    }

    .input-group input::placeholder {
        color: var(--text-muted, #888);
    }

    .submit-btn {
        width: 100%;
        padding: 16px;
        background-color: var(--primary-color, #007bff);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all var(--transition-normal, 250ms ease);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        margin-top: 8px;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
    }

    .submit-btn:active:not(:disabled) {
        transform: scale(0.98);
    }

    .submit-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .spinner {
        width: 20px;
        height: 20px;
        border: 2.5px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .footer {
        display: flex;
        justify-content: center;
        padding-top: var(--spacing-sm, 8px);
    }

    .secure-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background-color: var(--background, #f5f7fa);
        border-radius: 100px;
        font-size: 0.8rem;
        color: var(--text-secondary, #666);
        font-weight: 600;
    }

    .secure-badge svg {
        color: var(--success-color, #2e7d32);
    }
</style>
