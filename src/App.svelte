<script>
  import { onMount, tick } from "svelte";
  import Home from "./pages/Home.svelte";
  import ProductDetail from "../src/pages/ProductDetail.svelte";
  import AddProduct from "./pages/AddProduct.svelte";

  let currentPage = "home";
  let selectedProduct = null;

  onMount(() => {
    // Initial setup if needed
    if (typeof my !== "undefined") {
      if (my.canIUse("hideBackHome")) {
        my.hideBackHome();
      }
      // my.setNavigationBar({ title: "سوق الجيران" });
    }
  });

  function handleNavigateToDetail(event) {
    selectedProduct = event.detail;
    currentPage = "detail";
    if (typeof my !== "undefined") {
      my.vibrateShort();
      // my.setNavigationBar({ title: "تفاصيل المنتج" });
    }
  }

  function handleNavigateBack() {
    currentPage = "home";
    selectedProduct = null;
    if (typeof my !== "undefined") {
      // my.setNavigationBar({ title: "سوق الجيران" });
    }
  }

  function handleAddProduct() {
    currentPage = "add-product";
    if (typeof my !== "undefined") {
      my.vibrateShort();
      // my.setNavigationBar({ title: "Post New Ad" });
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
  {#if currentPage === "home"}
    <Home on:viewDetail={handleNavigateToDetail} on:add={handleAddProduct} />
  {:else if currentPage === "detail"}
    <ProductDetail product={selectedProduct} on:back={handleNavigateBack} />
  {:else if currentPage === "add-product"}
    <AddProduct on:success={handleSaveSuccess} on:cancel={handleCancelAdd} />
  {/if}
</main>

<style>
  main {
    max-width: 600px;
    margin: 0 auto;
    background-color: #f9f9f9;
    min-height: 100vh;
  }
</style>
