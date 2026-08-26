/* ==========================================================================
   North Star Bakery — script.js

   Feature: Pre-Order List
   Customers click "Add to Pre-Order" on products.html to build a list of
   items they want. That list is saved in localStorage, shown live on the
   Products page, and used to pre-fill the Item Details field on the
   Contact page so customers don't have to retype what they already picked.

   Also handles JavaScript validation for the Inquiry & Pre-Order Request
   Form on contact.html.
   ========================================================================== */

// ---------- Product data (array of objects) ----------
const PRODUCTS = [
  { id: "breads", name: "Fresh Bread Loaf", priceRange: "$5–$9" },
  { id: "pastries", name: "Pastries", priceRange: "$3–$6" },
  { id: "cakes", name: "Custom Cake", priceRange: "$25–$75" },
  { id: "signature-loaf", name: "Signature Sourdough Loaf", priceRange: "$5–$9" }
];

const CART_STORAGE_KEY = "northStarBakeryCart";

// errors is an object that tracks the current validation message for each
// form field, keyed by field id
const errors = {};

// ---------- Small helpers ----------
function findProduct(id) {
  return PRODUCTS.find(function (product) {
    return product.id === id;
  });
}

function loadCart() {
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// ---------- Pre-Order List feature (products.html) ----------
function addToCart(id) {
  const cart = loadCart();
  if (cart.indexOf(id) === -1) {
    cart.push(id);
    saveCart(cart);
  }
  renderCart();
}

function removeFromCart(id) {
  const cart = loadCart().filter(function (itemId) {
    return itemId !== id;
  });
  saveCart(cart);
  renderCart();
}

function clearCart() {
  saveCart([]);
  renderCart();
}

function renderCart() {
  const listEl = document.getElementById("pre-order-list");
  if (!listEl) return; // this function only runs on pages that have the list

  const cart = loadCart();
  listEl.innerHTML = "";

  if (cart.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-cart-message";
    emptyMessage.textContent = "You haven't added any items yet. Use the \"Add to Pre-Order\" buttons above.";
    listEl.appendChild(emptyMessage);
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "cart-items";

  cart.forEach(function (id) {
    const product = findProduct(id);
    if (!product) return;

    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = product.name + " (" + product.priceRange + ")";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-item";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", function () {
      removeFromCart(id);
    });

    li.appendChild(label);
    li.appendChild(removeBtn);
    ul.appendChild(li);
  });

  listEl.appendChild(ul);
}

function setupProductButtons() {
  const buttons = document.querySelectorAll(".add-to-order");
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      addToCart(button.dataset.id);
    });
  });
}

function setupClearCartButton() {
  const clearBtn = document.getElementById("clear-pre-order");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearCart);
  }
}

// ---------- Pre-fill contact form from saved cart (contact.html) ----------
function prefillItemDetails() {
  const textarea = document.getElementById("item-details");
  const summary = document.getElementById("cart-summary");
  if (!textarea && !summary) return; // not on the contact page

  const cart = loadCart();
  if (cart.length === 0) return;

  const names = cart.map(function (id) {
    const product = findProduct(id);
    return product ? product.name : id;
  });

  if (summary) {
    summary.textContent = "Saved from your Products page visit: " + names.join(", ") + ".";
  }

  if (textarea && !textarea.value.trim()) {
    textarea.value = "I'd like to pre-order: " + names.join(", ") + ".";
  }
}

// ---------- Form validation (contact.html) ----------
function showError(fieldId, message) {
  errors[fieldId] = message;
  const errorEl = document.getElementById(fieldId + "-error");
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function clearError(fieldId) {
  delete errors[fieldId];
  const errorEl = document.getElementById(fieldId + "-error");
  if (errorEl) {
    errorEl.textContent = "";
  }
}

function validateName() {
  const field = document.getElementById("full-name");
  const value = field.value.trim();

  if (value.length === 0) {
    showError("full-name", "Please enter your name.");
    return false;
  }
  if (value.length < 2) {
    showError("full-name", "Name must be at least 2 characters.");
    return false;
  }
  clearError("full-name");
  return true;
}

function validateEmail() {
  const field = document.getElementById("email");
  const value = field.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (value.length === 0) {
    showError("email", "Please enter your email address.");
    return false;
  }
  if (!emailPattern.test(value)) {
    showError("email", "Please enter a valid email address, like name@example.com.");
    return false;
  }
  clearError("email");
  return true;
}

function validatePickupDate() {
  const field = document.getElementById("pickup-date");
  const value = field.value;

  if (!value) {
    showError("pickup-date", "Please choose a pickup date.");
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const chosenDate = new Date(value + "T00:00:00");

  if (chosenDate < today) {
    showError("pickup-date", "Pickup date cannot be in the past.");
    return false;
  }
  clearError("pickup-date");
  return true;
}

function validateRequestType() {
  const field = document.getElementById("request-type");

  if (!field.value) {
    showError("request-type", "Please select a request type.");
    return false;
  }
  clearError("request-type");
  return true;
}

function validateForm() {
  const nameOk = validateName();
  const emailOk = validateEmail();
  const dateOk = validatePickupDate();
  const typeOk = validateRequestType();
  return nameOk && emailOk && dateOk && typeOk;
}

function setupContactForm() {
  const form = document.getElementById("preorder-form");
  if (!form) return; // not on the contact page

  // let our JavaScript control validation messaging instead of the browser's
  form.setAttribute("novalidate", "true");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const successEl = document.getElementById("form-success");
    const isValid = validateForm();

    if (isValid) {
      if (successEl) {
        successEl.textContent = "Thanks! Your pre-order request is ready to send.";
      }
      // the request has been "sent," so clear the saved pre-order list
      clearCart();
    } else if (successEl) {
      successEl.textContent = "";
    }
  });

  // clear/update error messages live as the user fixes each field
  document.getElementById("full-name").addEventListener("input", validateName);
  document.getElementById("email").addEventListener("input", validateEmail);
  document.getElementById("pickup-date").addEventListener("input", validatePickupDate);
  document.getElementById("request-type").addEventListener("change", validateRequestType);
}

// ---------- Run everything once the page has loaded ----------
document.addEventListener("DOMContentLoaded", function () {
  setupProductButtons();
  setupClearCartButton();
  renderCart();
  prefillItemDetails();
  setupContactForm();
});