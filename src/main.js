/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
    const { discount, sale_price, quantity } = purchase;
     return sale_price * quantity * (1 - discount / 100);
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
    const { profit } = seller;
    if (index === 0) return profit * 0.15;
    if (index === 1 || index === 2) return profit * 0.10;
    if (index === total - 1) return 0;
    return profit * 0.05;
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных
    if (!data 
        || !Array.isArray(data.sellers)
        || !Array.isArray(data.products)
        || !Array.isArray(data.purchase_records)
        || data.sellers.length === 0
        || data.products.length === 0
        || data.purchase_records.length === 0
    ) {
        throw new Error('Неправильные входные данные');
    }
    // @TODO: Проверка наличия опций
    if (!options || typeof options !== 'object') {
        throw new Error('Отсутствуют опции');
    }
    const { calculateRevenue, calculateBonus } = options;
    
    if (!calculateRevenue || !calculateBonus) {
        throw new Error('Отсутствуют функции расчета');
    }
    // @TODO: Подготовка промежуточных данных для сбора статистики
    const sellerStats = data.sellers.map(seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    }));
    // @TODO: Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = Object.fromEntries(
        sellerStats.map(seller => [seller.id, seller])
    );
    const productIndex = Object.fromEntries(
        data.products.map(product => [product.sku, product])
    );

    // @TODO: Расчет выручки и прибыли для каждого продавца
    data.purchase_records.forEach(record => {
        const seller = sellerIndex[record.seller_id];
        if (!seller) return;
        
        seller.sales_count += 1;
        
        record.items.forEach(item => {
            const product = productIndex[item.sku];
            if (!product) return;
            
            const cost = product.purchase_price * item.quantity;
            const revenue = calculateRevenue(item, product);
            
            seller.revenue += revenue;
            seller.profit += (revenue - cost);
            
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity;
        });
    });

    // @TODO: Сортировка продавцов по прибыли
    const sortedSellers = [...sellerStats].sort((a, b) => b.profit - a.profit);

    // @TODO: Назначение премий на основе ранжирования
    sortedSellers.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, sortedSellers.length, seller);
        
        const productsArray = Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({ sku, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
        
        seller.top_products = productsArray;
    });

    // @TODO: Подготовка итоговой коллекции с нужными полями
    // ИСПРАВЛЕНО: добавил недостающую закрывающую скобку
// @TODO: Подготовка итоговой коллекции с нужными полями
return sortedSellers.map(seller => ({
    seller_id: seller.id,
    name: seller.name,
    revenue: Number(seller.revenue.toFixed(2)),
    profit: Number(seller.profit.toFixed(2)),
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: Number(seller.bonus.toFixed(2))
}));
}

if (typeof window !== 'undefined') {
    window.calculateSimpleRevenue = calculateSimpleRevenue;
    window.calculateBonusByProfit = calculateBonusByProfit;
    window.analyzeSalesData = analyzeSalesData;
}