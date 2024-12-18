import { getCurrentDate, generateUID } from "./dateUtils.js";
import { exportToPDF } from "./exportUtils.js";
import { showToast } from "./modals.js";

const orderModal = document.getElementById('orderModal');
const paymentModal = document.getElementById('paymentModal');

const orderBootstrapModal = new bootstrap.Modal(orderModal);
const paymentBoostrapModal = new bootstrap.Modal(paymentModal);

document.addEventListener('alpine:init', () => {
    Alpine.store('order', {
        // Order List
        orders: [],
        filteredOrders: [],
        totalSales: 0,
        totalPayment: 0,
        totalKilograms: 0,
        totalOrders: 0,
        paidOrders: 0,
        unpaidOrders: 0,
        searchQuery: '',
        sortDirection: 'desc',
        sortLocation: '',
        sortStatus: '',
        sortPart: '',
        depositAmount: 0,
        selectedOrderId: '',
        
        // Order Information
        orderId: '',
        orderDate: '',
        customerName: '',
        selectedParts: [],
        quantity: 1,
        basePrice: 280,
        totalPrice: 0,
        payment: 0,
        balance: 0,
        selectedLocation: 'Puzon',

        calculateTotalPrice() {
            this.totalPrice = this.basePrice * this.quantity
            return this.totalPrice;
        },

        calculateBalance() {
            this.balance = this.totalPrice - this.payment;
            return this.balance;
        },

        calculateTotalSales() {
            const totalSales = this.orders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
            this.totalSales = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
            }).format(totalSales);
        },

        calculateTotalPayment() {
            const totalPayment = this.orders.reduce((sum, order) => sum + parseFloat(order.payment), 0)
            this.totalPayment = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP'
            }).format(totalPayment);
        },

        calculateTotalKilograms() {
            this.totalKilograms = this.orders.reduce((sum, order) => sum + parseFloat(order.quantity), 0)
        },

        calculatePaidOrders() {
            this.paidOrders = this.orders.filter(order => order.balance === 0).length;
        },

        calculateUnpaidOrders() {
            this.unpaidOrders = this.orders.filter(order => order.balance > 0).length;
        },

        filterOrdersByName() {
            this.retrieveOrders();
            if (this.searchQuery !== '') {
                this.orders = this.orders.filter(order =>
                    order.customerName.toLowerCase().includes(this.searchQuery.toLowerCase())
                );
            }
        },

        get determineStatus() {
            return this.balance > 0 ? 'unpaid' : 'paid';
        },

        sortOrdersByQuantity() {
            this.orders.sort((a, b) => {
                if (this.sortDirection === 'asc') {
                    return a.quantity - b.quantity
                } else {
                    return b.quantity - a.quantity
                }
            });
        },

        sortOrdersByStatus() {
            this.orders.sort((a, b) => {
                if (a.status === b.status) return 0; // If the same status the order will remain unchanged
                return a.status === 'unpaid' ? -1 : 1; // If a.status is paid, it will be placed before the b, otherwise vice versa
            })
        },

        filterOrdersByLocation() {
            this.retrieveOrders();

            if (this.sortLocation !== '') {
                this.orders = this.orders.filter(order => order.location === this.sortLocation);
            } 
        },

        filterOrdersByStatus() {
            this.retrieveOrders();

            if (this.sortStatus !== '') {
                this.orders = this.orders.filter(order => order.status === this.sortStatus)
            }
        },

        filterOrdersByMeatPart() {
            this.retrieveOrders();

            if (this.sortPart !== '') {
                this.orders = this.orders.filter(order => order.selectedParts.includes(this.sortPart))
            }
        },

        clearFilters() {
            this.sortLocation = "";
            this.sortStatus = "";
            this.sortPart = "";

            this.retrieveOrders();
        },

        clearSearch() {
            this.searchQuery = '';
            this.retrieveOrders();
        },

        resetOrder() {
            this.orderId = generateUID();
            this.customerName = '';
            this.selectedParts = [];
            this.quantity = 1;
            this.totalPrice = 0;
            this.payment = 0;
            this.balance = 0;
            this.selectedLocation = 'Puzon';
        },
        
        validateOrder() {
            if (!this.customerName.trim()) return 'Customer name is required.';
            if (this.selectedParts.length === 0) return 'Please select at least one meat part.';
            if (this.quantity <= 0) return 'Quantity must be greater than zero.';
            if (this.payment < 0) return 'Payment cannot be negative.';
            return null;
        },

        processOrder() {
            const validationError = this.validateOrder();

            if (validationError) {
                showToast('error', validationError);
                return;
            }

            const orderData = {
                orderId: this.orderId || generateUID(),
                orderDate: this.orderDate || getCurrentDate(),
                customerName: this.customerName,
                selectedParts: this.selectedParts,
                quantity: this.quantity,
                totalPrice: this.totalPrice,
                payment: this.payment,
                balance: this.calculateBalance(),
                status: this.determineStatus,
                location: this.selectedLocation,
            };

            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(orderData);
            localStorage.setItem('orders', JSON.stringify(orders));

            this.resetOrder();

            showToast('success', 'Order placed successfully!');

            const addAnother = confirm('Do you want to add another order?');

            if (!addAnother) {
                orderBootstrapModal.hide();
            }
            
            this.retrieveOrders();
            
        },

        retrieveOrders() {
            this.orders = JSON.parse(localStorage.getItem('orders')) || [];
            this.totalOrders = this.orders.length;

            // Sorts order by quantity (kg)
            this.sortOrdersByQuantity();
            this.sortOrdersByStatus();
            

            // Initializes card data
            this.calculateTotalSales();
            this.calculateTotalPayment();
            this.calculateTotalKilograms();
            this.calculatePaidOrders();
            this.calculateUnpaidOrders();
        },
        
        deleteOrders() {
            const deleteAll = confirm('Are you sure you want to delete all orders?');

            if (deleteAll) {
                localStorage.clear();
                this.retrieveOrders();
                alert('Orders deleted successfully!');
            }
            
            showToast('success', 'Orders deleted successfully!');

            this.retrieveOrders();
        },

        deleteOrder(orderId) {
            const confirmDeletion = confirm('Are you sure you want to delete this order?');

            if (confirmDeletion) {
                // Get the orders from the local storage
                const orders = JSON.parse(localStorage.getItem('orders')) || [];

                this.orders = orders.filter(order => order.orderId !== orderId);

                localStorage.setItem('orders', JSON.stringify(this.orders));

                showToast('success', 'Order deleted successfully!');
            }

            this.retrieveOrders();
        },

        processDeposit(orderId) {
            const deposit = parseFloat(this.depositAmount);

            if (isNaN(deposit) || deposit < 0) {
                showToast('error', 'Please enter a valid deposit amount')
                this.resetDepositInformation()
                return;
            }

            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const order = orders.find(o => o.orderId === orderId);

            if (order) {
                const remainingBalance = order.balance - deposit;

                if (remainingBalance < 0) {
                    showToast('error', 'Deposit exceeds remaining balance!');
                    this.resetDepositInformation();
                    return;
                }

                order.payment += deposit;
                order.balance = remainingBalance;
                order.status = remainingBalance === 0 ? 'paid' : 'unpaid';

                localStorage.setItem('orders', JSON.stringify(orders));
                showToast('success', 'Payment processed successfully!');

                this.resetDepositInformation();
                this.retrieveOrders();
            }

        },

        resetDepositInformation() {
            this.depositAmount = 0;
            this.selectedOrderId = '';
        },

        saveAsPDF(orders) {
            exportToPDF(orders);
        },

        getImage(selectedParts) {
            const meatPart = selectedParts[0].replace(/\s+/g, '_').toLowerCase();
            return `assets/pork_cuts/${meatPart}.png`;
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
});