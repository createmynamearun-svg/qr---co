import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ClipboardList, ArrowLeft, Star, HandHelping, Search, Plus, Minus, Trash2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { menuItems as allMenuItems, categories, systemSettings, mockOrders, MenuItem } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
}

type ViewType = 'menu' | 'cart' | 'orders';

const CustomerMenu = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableFromUrl = searchParams.get('table');
  const { toast } = useToast();

  const [currentView, setCurrentView] = useState<ViewType>('menu');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems] = useState<MenuItem[]>(allMenuItems.filter(item => item.is_available));
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);

  const { items: cartItems, addItem, removeItem, updateQuantity, getTotalItems, getTotalPrice, clearCart, setTableNumber, tableNumber } = useCartStore();

  useEffect(() => {
    if (tableFromUrl) {
      setTableNumber(tableFromUrl);
    }
  }, [tableFromUrl, setTableNumber]);

  // Simulate customer orders from mock data
  useEffect(() => {
    if (tableNumber) {
      const tableOrders = mockOrders
        .filter(o => o.table_number === tableNumber)
        .map(o => ({
          id: o.id,
          order_number: o.order_number,
          status: o.status,
          total_amount: o.total_amount,
          created_at: o.created_at,
        }));
      setCustomerOrders(tableOrders);
    }
  }, [tableNumber]);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      image_url: item.image_url,
    });
    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart.`,
    });
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before placing an order.',
        variant: 'destructive',
      });
      return;
    }

    if (!tableNumber) {
      toast({
        title: 'No table selected',
        description: 'Please scan the QR code at your table.',
        variant: 'destructive',
      });
      return;
    }

    const subtotal = getTotalPrice();
    const taxAmount = subtotal * (systemSettings.tax_rate / 100);
    const total = subtotal + taxAmount;

    // Create a mock order
    const newOrder: CustomerOrder = {
      id: `ORD${Date.now()}`,
      order_number: `ORD${Date.now().toString().slice(-4)}`,
      status: 'pending',
      total_amount: total,
      created_at: new Date().toISOString(),
    };

    setCustomerOrders(prev => [newOrder, ...prev]);

    toast({
      title: 'Order Placed!',
      description: `Order #${newOrder.order_number} has been sent to the kitchen.`,
    });

    clearCart();
    setCurrentView('orders');
  };

  const handleCallWaiter = () => {
    if (!tableNumber) {
      toast({
        title: 'No table selected',
        description: 'Please scan the QR code at your table.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Help is on the way!',
      description: 'A staff member will be with you shortly.',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-warning/20 text-warning border-0">Placed</Badge>;
      case 'preparing':
        return <Badge className="bg-info/20 text-info border-0">Preparing</Badge>;
      case 'ready':
        return <Badge className="bg-success/20 text-success border-0">Ready</Badge>;
      case 'completed':
        return <Badge className="bg-muted text-muted-foreground border-0">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const currencySymbol = systemSettings.currency_symbol;
  const taxRate = systemSettings.tax_rate;

  const renderMenu = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full flex overflow-x-auto gap-1 h-auto p-1">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="flex-shrink-0 text-xs px-3 py-1.5"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Menu Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="overflow-hidden card-hover">
                <div className="relative h-32">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.is_vegetarian && (
                    <Badge className="absolute top-2 left-2 bg-success text-success-foreground text-xs">
                      Veg
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary">
                      {currencySymbol}{item.price}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      className="h-8"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No items found
        </div>
      )}
    </div>
  );

  const renderCart = () => (
    <div className="space-y-4">
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Your cart is empty</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setCurrentView('menu')}
          >
            Browse Menu
          </Button>
        </div>
      ) : (
        <>
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {currencySymbol}{item.price} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Order Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{currencySymbol}{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({taxRate}%)</span>
                <span>{currencySymbol}{(getTotalPrice() * taxRate / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">
                  {currencySymbol}{(getTotalPrice() * (1 + taxRate / 100)).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handlePlaceOrder}
          >
            Place Order
          </Button>
        </>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4">
      {customerOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Orders Yet</h3>
          <p className="text-muted-foreground text-sm">
            Your orders will appear here once placed.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setCurrentView('menu')}
          >
            Back to Menu
          </Button>
        </div>
      ) : (
        customerOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">#{order.order_number}</span>
                {getStatusBadge(order.status)}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                <span className="font-medium text-foreground">
                  {currencySymbol}{order.total_amount.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold">{systemSettings.restaurant_name}</h1>
                {tableNumber && (
                  <p className="text-xs text-muted-foreground">Table {tableNumber}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleCallWaiter}>
                <HandHelping className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-4">
        {currentView === 'menu' && renderMenu()}
        {currentView === 'cart' && renderCart()}
        {currentView === 'orders' && renderOrders()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t pb-safe">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-2">
            {[
              { view: 'menu' as ViewType, icon: Star, label: 'Menu' },
              { view: 'cart' as ViewType, icon: ShoppingCart, label: 'Cart', badge: getTotalItems() },
              { view: 'orders' as ViewType, icon: ClipboardList, label: 'Orders', badge: customerOrders.filter(o => o.status !== 'completed').length },
            ].map(({ view, icon: Icon, label, badge }) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  currentView === view
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default CustomerMenu;
