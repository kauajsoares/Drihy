import { auth, database } from "./firebase-config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

class MobileNavbar {
  constructor(mobileMenu, navList, navLinks) {
    this.mobileMenu = document.querySelector(mobileMenu);
    this.navList = document.querySelector(navList);
    this.navLinks = document.querySelectorAll(navLinks);
    this.activeClass = "active";

    this.handleClick = this.handleClick.bind(this);
  }

  animateLinks() {
    this.navLinks.forEach((link, index) => {
      link.style.animation
        ? (link.style.animation = "")
        : (link.style.animation = `navLinkFade 0.5s ease forwards ${
            index / 7 + 0.3
          }s`);
    });
  }

  handleClick() {
    this.navList.classList.toggle(this.activeClass);
    this.mobileMenu.classList.toggle(this.activeClass);
    this.animateLinks();
  }

  addClickEvent() {
    this.mobileMenu.addEventListener("click", this.handleClick);
  }

  init() {
    if (this.mobileMenu) {
      this.addClickEvent();
    }
    return this;
  }
}

const mobileNavbar = new MobileNavbar(
  ".mobile-menu",
  ".nav-list",
  ".nav-list li",
);
mobileNavbar.init();

onAuthStateChanged(auth, (user) => {
    const badge = document.querySelector('.cart-badge');
    
    if (!badge) return;

    if (user) {
        const cartRef = ref(database, `users/${user.uid}/cart`);
        
        onValue(cartRef, (snapshot) => {
            const cart = snapshot.val() || [];
            let totalQuantity = 0;
            
            if (Array.isArray(cart)) {
                cart.forEach(item => {
                    if (item) {
                        totalQuantity += parseInt(item.quantity || 1);
                    }
                });
            } else if (typeof cart === 'object') {
                 Object.values(cart).forEach(item => {
                    if (item) {
                        totalQuantity += parseInt(item.quantity || 1);
                    }
                 });
            }

            if (totalQuantity > 0) {
                badge.textContent = totalQuantity;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    } else {
        badge.style.display = 'none';
    }
});