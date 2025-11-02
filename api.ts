import type { Buyer, Product, Bill, LogEntry } from './types';
import { Gender } from './types';

// --- MOCK DATABASE ---

interface Database {
    buyers: Buyer[];
    products: Product[];
    bills: Bill[];
    logs: LogEntry[];
}

const DB_KEY = 'pro-bill-db';

const PRODUCT_CATEGORIES = ['Gadget', 'Book', 'Apparel', 'Home Good', 'Toy', 'Tool', 'Accessory'];
const PRODUCT_ADJECTIVES = ['Premium', 'Artisanal', 'Gourmet', 'Organic', 'Handcrafted', 'Vintage', 'Modern'];

function generateProducts(count: number): Product[] {
    const products: Product[] = [];
    for (let i = 1; i <= count; i++) {
        const category = PRODUCT_CATEGORIES[Math.floor(Math.random() * PRODUCT_CATEGORIES.length)];
        const adjective = PRODUCT_ADJECTIVES[Math.floor(Math.random() * PRODUCT_ADJECTIVES.length)];
        const name = `${adjective} ${category} #${Math.floor(Math.random() * 1000)}`;
        const rate = parseFloat((Math.random() * (20000 - 50) + 50).toFixed(2));
        products.push({ id: i.toString(), name, rate });
    }
    return products;
}

function getDB(): Database {
    try {
        const db = localStorage.getItem(DB_KEY);
        if (db) {
            const parsedDb = JSON.parse(db);
            // Ensure products exist for older versions
            if (!parsedDb.products || parsedDb.products.length < 100) {
                 parsedDb.products = generateProducts(2000);
                 saveDB(parsedDb);
            }
            return parsedDb;
        }
    } catch (e) {
        console.error("Failed to parse DB from localStorage", e);
    }
    // Initialize DB if not present or corrupt
    const initialDb: Database = {
        buyers: [
            { id: '1', name: 'John Doe', contact: '123-456-7890', email: 'john.doe@example.com', address: '123 Main St, Anytown, USA', gender: Gender.Male },
            { id: '2', name: 'Jane Smith', contact: '987-654-3210', email: 'jane.smith@example.com', address: '456 Oak Ave, Somewhere, USA', gender: Gender.Female },
        ],
        products: generateProducts(2000),
        bills: [],
        logs: [],
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
    return initialDb;
}

function saveDB(db: Database) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// --- API SIMULATION ---
const LATENCY = 200; // ms

function simulateRequest<T>(data: T, latency = LATENCY): Promise<T> {
    return new Promise(resolve => {
        setTimeout(() => resolve(data), latency);
    });
}

function simulateError(message: string): Promise<never> {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), LATENCY);
    });
}

// --- AUTHENTICATION API ---
const AUTH_TOKEN_KEY = 'pro-bill-auth-token';

export const api = {
    async login(password: string): Promise<{ success: true }> {
        if (password === 'admin') {
            const token = `fake-token-${Date.now()}`;
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            await this.addLog('Authentication', 'User logged in successfully.');
            return simulateRequest({ success: true });
        }
        return simulateError('Invalid password provided.');
    },

    async logout(): Promise<{ success: true }> {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        await this.addLog('Authentication', 'User logged out.');
        return simulateRequest({ success: true });
    },

    async checkAuth(): Promise<{ isAuthenticated: boolean }> {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        return simulateRequest({ isAuthenticated: !!token }, 100);
    },
    
    // --- DATA API ---

    // FIX: Update return type to include productsCount to match implementation.
    async getInitialData(): Promise<Omit<Database, 'products'> & { productsCount: number }> {
        const db = getDB();
        return simulateRequest({
            buyers: db.buyers,
            bills: db.bills,
            logs: db.logs,
            productsCount: db.products.length,
        });
    },
    
    // --- LOGS ---
    async addLog(action: string, details: string): Promise<LogEntry> {
        const db = getDB();
        const newLog: LogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action,
            details,
        };
        db.logs = [newLog, ...db.logs];
        saveDB(db);
        return simulateRequest(newLog, 10);
    },
    
    // --- BUYERS ---
    async getBuyers(): Promise<Buyer[]> {
        const db = getDB();
        return simulateRequest(db.buyers);
    },
    async addBuyer(buyerData: Omit<Buyer, 'id'>): Promise<Buyer> {
        const db = getDB();
        const newBuyer = { ...buyerData, id: Date.now().toString() };
        db.buyers = [newBuyer, ...db.buyers];
        await this.addLog('Buyer Management', `Added new buyer: ${newBuyer.name}`);
        saveDB(db);
        return simulateRequest(newBuyer);
    },
    async updateBuyer(updatedBuyer: Buyer): Promise<Buyer> {
        const db = getDB();
        db.buyers = db.buyers.map(b => b.id === updatedBuyer.id ? updatedBuyer : b);
        await this.addLog('Buyer Management', `Updated buyer details for: ${updatedBuyer.name}`);
        saveDB(db);
        return simulateRequest(updatedBuyer);
    },
    async deleteBuyer(id: string): Promise<{ id: string }> {
        const db = getDB();
        const buyerName = db.buyers.find(b => b.id === id)?.name || 'Unknown';
        db.buyers = db.buyers.filter(b => b.id !== id);
        await this.addLog('Buyer Management', `Deleted buyer: ${buyerName}`);
        saveDB(db);
        return simulateRequest({ id });
    },

    // --- PRODUCTS ---
    async getPaginatedProducts({ page, limit }: { page: number, limit: number }): Promise<{ products: Product[], totalPages: number }> {
        const db = getDB();
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedProducts = db.products.slice(start, end);
        const totalPages = Math.ceil(db.products.length / limit);
        return simulateRequest({ products: paginatedProducts, totalPages });
    },
     async getAllProductsForExport(): Promise<Product[]> {
        const db = getDB();
        return simulateRequest(db.products, 1000); // Simulate longer export time
    },
     async searchProducts(term: string): Promise<Product[]> {
        if (!term) return simulateRequest([]);
        const db = getDB();
        const lowerCaseTerm = term.toLowerCase();
        const results = db.products.filter(p => 
            p.name.toLowerCase().includes(lowerCaseTerm) || 
            p.id.toString() === lowerCaseTerm
        ).slice(0, 20); // Limit results for performance
        return simulateRequest(results);
    },
    async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
        const db = getDB();
        const newId = (db.products.length > 0 ? Math.max(...db.products.map(p => parseInt(p.id))) + 1 : 1).toString()
        const newProduct = { ...productData, id: newId };
        db.products = [newProduct, ...db.products]; // Add to top for easy viewing if paginated
        await this.addLog('Product Management', `Added new product: ${newProduct.name}`);
        saveDB(db);
        return simulateRequest(newProduct);
    },
    async updateProduct(updatedProduct: Product): Promise<Product> {
        const db = getDB();
        db.products = db.products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        await this.addLog('Product Management', `Updated product details for: ${updatedProduct.name}`);
        saveDB(db);
        return simulateRequest(updatedProduct);
    },
    async deleteProduct(id: string): Promise<{ id: string }> {
        const db = getDB();
        const productName = db.products.find(p => p.id === id)?.name || `ID ${id}`;
        db.products = db.products.filter(p => p.id !== id);
        await this.addLog('Product Management', `Deleted product: ${productName}`);
        saveDB(db);
        return simulateRequest({ id });
    },

    // --- BILLS ---
    async addBill(billData: Omit<Bill, 'id' | 'billNumber'>): Promise<Bill> {
        const db = getDB();
        const newBill = { 
            ...billData, 
            id: Date.now().toString(),
            billNumber: `BILL-${(db.bills.length + 1).toString().padStart(4, '0')}`
        };
        db.bills = [newBill, ...db.bills];
        await this.addLog('Billing', `Generated bill ${newBill.billNumber} for ${newBill.buyerName}`);
        saveDB(db);
        return simulateRequest(newBill);
    }
};