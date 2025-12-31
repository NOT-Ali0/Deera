<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { qi } from "../lib/qi.js";

  const dispatch = createEventDispatcher();

  let products = [];
  let isRefreshing = false;

  onMount(() => {
    loadProducts();
  });

  function loadProducts() {
    isRefreshing = true;
    qi.getStorage({
      key: "products",
      success: (res) => {
        isRefreshing = false;
        if (res.data) {
          products = res.data;
        }
      },
    });
  }

  // Simulate Pull-to-refresh
  function handleRefresh() {
    qi.showLoading({ content: "Refreshing..." });
    setTimeout(() => {
      // Fake delay
      loadProducts();
      qi.hideLoading();
      qi.showToast({ content: "Updated", type: "success" });
    }, 800);
  }

  function handlePostAd() {
    // Dispatch navigation event to App.svelte
    dispatch("add");
  }

  // Legacy functions removed or kept harmless if needed, but cleaning up is better.
  // ... imports of qi are likely still there.

  function goToDetail(product) {
    dispatch("viewDetail", product);
  }
</script>

<div class="home-container">
  <header>
    <h1>Neighbors Market</h1>
    <button class="refresh-btn" onclick={handleRefresh} disabled={isRefreshing}>
      ↻
    </button>
  </header>

  <main>
    <div class="product-list">
      {#if products.length === 0}
        <div class="empty-state">
          <p>No ads nearby. Be the first to post!</p>
        </div>
      {:else}
        {#each products as product (product.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            class="product-card"
            onclick={() => goToDetail(product)}
            role="button"
            tabindex="0"
          >
            <img src={product.image} alt={product.name} />
            <div class="info">
              <h3>{product.name}</h3>
              <p class="price">{product.price}</p>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </main>

  <button class="post-ad-btn" onclick={handlePostAd}> Post Ad </button>
</div>

<style>
  .home-container {
    padding: 16px;
    font-family: sans-serif;
    padding-bottom: 80px; /* Space for fixed button */
  }

  header h1 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
  }

  .product-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .product-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .product-card img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    background-color: #f0f0f0;
  }

  .info {
    padding: 12px;
  }

  .info h3 {
    margin: 0 0 8px 0;
    font-size: 1rem;
    color: #444;
  }

  .info .price {
    margin: 0;
    font-weight: bold;
    color: #2e7d32;
  }

  .post-ad-btn {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 24px;
    font-size: 1rem;
    font-weight: bold;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    z-index: 100;
  }

  .post-ad-btn:active {
    transform: translateX(-50%) scale(0.98);
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 1.1rem;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  header h1 {
    margin-bottom: 0;
  }

  .refresh-btn {
    background: none;
    border: 1px solid #ddd;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    cursor: pointer;
    color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .refresh-btn:hover {
    background: #f0f0f0;
  }
</style>
