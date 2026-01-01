<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { qi } from "./lib/qi.js";
  import Home from "./pages/Home.svelte";
  import ProductDetail from "../src/pages/ProductDetail.svelte";
  import AddProduct from "./pages/AddProduct.svelte";
  import LoginView from "./pages/LoginView.svelte";

  let currentPage = "home";
  let selectedProduct = null;
  let isAuthenticated = false;
  let userToken = null;
  let isCheckingAuth = true;

  onMount(() => {
    // Check authentication status
    // RemoveToken();
    checkAuthentication();

    // Initial setup if needed
    if (typeof my !== "undefined") {
      if (my.canIUse && my.canIUse("hideBackHome")) {
        my.hideBackHome();
      }
    }
  });
  let RemoveToken = () => {
    my.removeStorage({
      key: "userToken",
      success: () => {
        userToken = null;
        isAuthenticated = false;
        currentPage = "home";
      },
    });
  };

  function checkAuthentication() {
    qi.getStorage({
      key: "userToken",
      success: (res) => {
        if (res.data) {
          userToken = res.data;
          isAuthenticated = true;
        }
        isCheckingAuth = false;
      },
      fail: () => {
        isCheckingAuth = false;
      },
    });
  }

  function handleLoginSuccess(event) {
    userToken = event.detail;
    isAuthenticated = true;
    qi.vibrateShort();
  }

  function handleNavigateToDetail(event) {
    selectedProduct = event.detail;
    currentPage = "detail";
    if (typeof my !== "undefined") {
      my.vibrateShort();
    }
  }

  function handleNavigateBack() {
    currentPage = "home";
    selectedProduct = null;
    if (typeof my !== "undefined") {
    }
  }

  function handleAddProduct() {
    currentPage = "add-product";
    if (typeof my !== "undefined") {
      my.vibrateShort();
    }
  }

  function handleSaveSuccess() {
    currentPage = "home";
    // Ideally trigger a refresh on Home, but for now just switch back.
    // Home's onMount/focus logic might handle it, or we need a refresh signal.
  }

  function handleCancelAdd() {
    currentPage = "home";
  }
</script>

<main>
  {#if isCheckingAuth}
    <!-- Loading state while checking authentication -->
    <div class="loading-container">
      <div class="spinner"></div>
      <p>جاري التحميل...</p>
    </div>
  {:else if !isAuthenticated}
    <!-- Show login view if not authenticated -->
    <div in:fade={{ duration: 300 }}>
      <LoginView on:loginSuccess={handleLoginSuccess} />
    </div>
  {:else if currentPage === "home"}
    <div in:fade={{ duration: 300 }}>
      <Home
        on:viewDetail={handleNavigateToDetail}
        on:add={handleAddProduct}
        {userToken}
      />
    </div>
  {:else if currentPage === "detail"}
    <div in:fade={{ duration: 300 }}>
      <ProductDetail product={selectedProduct} on:back={handleNavigateBack} />
    </div>
  {:else if currentPage === "add-product"}
    <div in:fade={{ duration: 300 }}>
      <AddProduct
        on:success={handleSaveSuccess}
        on:cancel={handleCancelAdd}
        {userToken}
      />
    </div>
  {/if}
</main>

<style>
  :global(:root) {
    /* Color Variables */
    --primary-color: #007bff;
    --primary-dark: #0056b3;
    --primary-light: #e7f3ff;
    --success-color: #2e7d32;
    --success-light: #e8f5e9;
    --danger-color: #d32f2f;
    --danger-light: #ffebee;
    --text-primary: #1a1a1a;
    --text-secondary: #666;
    --text-muted: #888;
    --border-color: #e0e0e0;
    --background: #f5f7fa;
    --surface: #ffffff;
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);

    /* Spacing Variables */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;

    /* Border Radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --radius-full: 9999px;

    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 350ms ease;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    background: var(--background);
    color: var(--text-primary);
  }

  main {
    max-width: 600px;
    margin: 0 auto;
    background-color: var(--background);
    min-height: 100vh;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: var(--spacing-md);
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-container p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1rem;
  }
</style>
