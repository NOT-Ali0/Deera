<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { qi } from "../lib/qi.js";
  import { UserToken } from "../lib/UserInfo.js";

  const dispatch = createEventDispatcher();

  let products = [];
  let isRefreshing = false;

  onMount(() => {
    qi.setNavigationBar({
      title: "Deera",
      backgroundColor: "#ffffff",
    });
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

  // // Simulate Pull-to-refresh
  // function handleRefresh() {
  //   qi.showLoading({ content: "Refreshing..." });
  //   setTimeout(() => {
  //     // Fake delay
  //     loadProducts();
  //     qi.hideLoading();
  //     qi.showToast({ content: "Updated", type: "success" });
  //   }, 800);
  // }

  function handlePostAd() {
    dispatch("add");
  }


  function goToDetail(product) {
    dispatch("viewDetail", product);
  }
</script>

<div class="home-container">
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

  <button class="post-ad-btn" onclick={handlePostAd}>Add Post</button>
</div>

<style>
  .home-container {
    padding: var(--spacing-md);
    padding-bottom: 100px; /* Space for fixed button */
  }

  .product-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .product-card {
    border: none;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--surface);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: all var(--transition-normal);
  }

  .product-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .product-card:active {
    transform: scale(0.98);
  }

  .product-card img {
    width: 100%;
    height: 160px;
    object-fit: cover;
    background-color: var(--background);
  }

  .info {
    padding: var(--spacing-md);
  }

  .info h3 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .info .price {
    margin: 0;
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--success-color);
  }

  .post-ad-btn {
    position: fixed;
    bottom: var(--spacing-lg);
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(
      135deg,
      var(--primary-color) 0%,
      var(--primary-dark) 100%
    );
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: var(--radius-full);
    font-size: 1.05rem;
    font-weight: 700;
    box-shadow: var(--shadow-lg);
    cursor: pointer;
    z-index: 100;
    transition: all var(--transition-normal);
    letter-spacing: 0.3px;
  }

  .post-ad-btn:hover {
    box-shadow: 0 12px 32px rgba(0, 123, 255, 0.3);
    transform: translateX(-50%) translateY(-2px);
  }

  .post-ad-btn:active {
    transform: translateX(-50%) scale(0.95);
  }

  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: var(--spacing-xl) var(--spacing-md);
    color: var(--text-muted);
    font-size: 1.05rem;
  }
</style>
