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

// LÓGICA DO CARRINHO (NOVA)
function updateCartBadge() {
    // Pega o carrinho do localStorage ou cria array vazio
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Soma a quantidade de todos os itens
    let totalQuantity = 0;
    cart.forEach(item => {
        // Se o item tiver propriedade quantity usa ela, senão assume 1
        totalQuantity += parseInt(item.quantity || 1);
    });

    // Atualiza o badge no HTML
    const badge = document.querySelector('.cart-badge');
    
    if (badge) {
        if (totalQuantity > 0) {
            badge.textContent = totalQuantity;
            badge.style.display = 'flex'; // Mostra se tiver itens
        } else {
            badge.style.display = 'none'; // Esconde se estiver vazio
        }
    }
}

// Executa assim que a página carrega
document.addEventListener('DOMContentLoaded', updateCartBadge);

// Escuta mudanças no localStorage (para atualizar em outras abas em tempo real)
window.addEventListener('storage', updateCartBadge);