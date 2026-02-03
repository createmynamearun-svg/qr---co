import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Volume2, VolumeX, BarChart3, Receipt, Clock, ArrowLeft, FileText, Banknote, Smartphone, CreditCard as CardIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockOrders, systemSettings, Order } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const BillingCounter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [activeTab, setActiveTab] = useState<'billing' | 'history' | 'analytics'>('billing');

  const readyOrders = orders.filter((o) => o.status === 'ready');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const handleCompletePayment = () => {
    if (!selectedOrder) return;

    setOrders(prev => prev.map(order =>
      order.id === selectedOrder.id
        ? { ...order, status: 'completed' as const, payment_mode: selectedPaymentMethod }
        : order
    ));

    toast({
      title: 'Payment Completed',
      description: `Order #${selectedOrder.order_number} has been paid via ${selectedPaymentMethod}.`,
    });

    setSelectedOrder(null);
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    return mins < 1 ? 'Just now' : `${mins}m ago`;
  };

  const currencySymbol = systemSettings.currency_symbol;

  const todayTotal = completedOrders.reduce((acc, order) => acc + order.total_amount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h1 className="font-bold">Billing Counter</h1>
                  <p className="text-xs text-muted-foreground">
                    {readyOrders.length} orders ready for billing
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-6">
            <TabsTrigger value="billing" className="gap-2">
              <Receipt className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <FileText className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="billing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ready Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-success" />
                    Ready for Billing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AnimatePresence>
                    {readyOrders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No orders ready for billing</p>
                      </div>
                    ) : (
                      readyOrders.map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                        >
                          <Card
                            className={`cursor-pointer card-hover border-2 ${
                              selectedOrder?.id === order.id
                                ? 'border-primary bg-primary/5'
                                : 'border-success/30 bg-success/5'
                            }`}
                            onClick={() => setSelectedOrder(order)}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Badge variant="outline" className="font-bold mb-2">
                                    {order.table_number}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground">
                                    Order #{order.order_number}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-lg">
                                    {currencySymbol}{order.total_amount.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {getTimeAgo(order.created_at)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Invoice Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Invoice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOrder ? (
                    <div className="space-y-4">
                      {/* Order Items */}
                      <div className="space-y-2">
                        {selectedOrder.items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span>
                              {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Totals */}
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>{currencySymbol}{selectedOrder.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax</span>
                          <span>{currencySymbol}{selectedOrder.tax_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Service Charge</span>
                          <span>{currencySymbol}{selectedOrder.service_charge.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total</span>
                          <span className="text-primary">
                            {currencySymbol}{selectedOrder.total_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="pt-4">
                        <p className="text-sm font-medium mb-3">Payment Method</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'cash', icon: Banknote, label: 'Cash' },
                            { id: 'upi', icon: Smartphone, label: 'UPI' },
                            { id: 'card', icon: CardIcon, label: 'Card' },
                          ].map(({ id, icon: Icon, label }) => (
                            <Button
                              key={id}
                              variant={selectedPaymentMethod === id ? 'default' : 'outline'}
                              className="flex flex-col h-auto py-3 gap-1"
                              onClick={() => setSelectedPaymentMethod(id as typeof selectedPaymentMethod)}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="text-xs">{label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Button
                        className="w-full bg-success hover:bg-success/90"
                        size="lg"
                        onClick={handleCompletePayment}
                      >
                        Complete Payment
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select an order to view invoice</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {completedOrders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No completed orders today</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {completedOrders.map((order) => (
                      <Card key={order.id} className="bg-muted/50">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <Badge variant="outline">{order.table_number}</Badge>
                            <span className="ml-2 text-sm text-muted-foreground">
                              #{order.order_number}
                            </span>
                            {order.payment_mode && (
                              <Badge variant="secondary" className="ml-2">
                                {order.payment_mode.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          <span className="font-medium">
                            {currencySymbol}{order.total_amount.toFixed(2)}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Today's Revenue</p>
                  <p className="text-3xl font-bold text-primary">
                    {currencySymbol}{todayTotal.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-success/5 border-success/20">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Orders Completed</p>
                  <p className="text-3xl font-bold text-success">{completedOrders.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-warning/5 border-warning/20">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Avg. Order Value</p>
                  <p className="text-3xl font-bold text-warning">
                    {currencySymbol}
                    {completedOrders.length > 0
                      ? (todayTotal / completedOrders.length).toFixed(2)
                      : '0.00'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BillingCounter;
