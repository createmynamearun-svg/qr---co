import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Volume2, VolumeX, Clock, Play, Check, ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockOrders, mockWaiterCalls, Order } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const KitchenDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [waiterCallsCount] = useState(mockWaiterCalls.filter(c => c.status === 'pending').length);
  const [isMuted, setIsMuted] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  const handleStartPrep = (orderId: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: 'preparing' as const } : order
    ));
    toast({
      title: 'Order Started',
      description: 'Order is now being prepared.',
    });
  };

  const handleMarkReady = (orderId: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: 'ready' as const } : order
    ));
    toast({
      title: 'Order Ready',
      description: 'Order is ready for serving.',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'preparing':
        return 'bg-info/10 text-info border-info/20';
      case 'ready':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    return mins < 1 ? 'Just now' : `${mins}m ago`;
  };

  const OrderCard = ({ order, showActions }: { order: Order; showActions?: 'start' | 'ready' }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={`border-2 ${getStatusColor(order.status)}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-base font-bold">
                {order.table_number}
              </Badge>
              <span className="text-xs text-muted-foreground">
                #{order.order_number}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {getTimeAgo(order.created_at)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  <span className="font-medium">{item.quantity}x</span> {item.name}
                  {item.special_notes && (
                    <span className="block text-xs text-muted-foreground">
                      Note: {item.special_notes}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {showActions === 'start' && (
            <Button
              className="w-full"
              onClick={() => handleStartPrep(order.id)}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Preparation
            </Button>
          )}

          {showActions === 'ready' && (
            <Button
              className="w-full bg-success hover:bg-success/90"
              onClick={() => handleMarkReady(order.id)}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark Ready
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

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
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h1 className="font-bold">Kitchen Display</h1>
                  <p className="text-xs text-muted-foreground">
                    {pendingOrders.length} pending • {preparingOrders.length} preparing
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

      {/* Waiter Calls Alert */}
      {waiterCallsCount > 0 && (
        <div className="bg-warning/10 border-b border-warning/20 px-4 py-2">
          <div className="container mx-auto flex items-center gap-2 text-warning">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">
              {waiterCallsCount} waiter call{waiterCallsCount > 1 ? 's' : ''} pending
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Orders */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-warning animate-pulse" />
              <h2 className="font-semibold">Pending ({pendingOrders.length})</h2>
            </div>
            <div className="space-y-4">
              <AnimatePresence>
                {pendingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} showActions="start" />
                ))}
              </AnimatePresence>
              {pendingOrders.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No pending orders
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Preparing Orders */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-info animate-pulse" />
              <h2 className="font-semibold">Preparing ({preparingOrders.length})</h2>
            </div>
            <div className="space-y-4">
              <AnimatePresence>
                {preparingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} showActions="ready" />
                ))}
              </AnimatePresence>
              {preparingOrders.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No orders in preparation
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Ready Orders */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-success" />
              <h2 className="font-semibold">Ready ({readyOrders.length})</h2>
            </div>
            <div className="space-y-4">
              <AnimatePresence>
                {readyOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </AnimatePresence>
              {readyOrders.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No orders ready
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KitchenDashboard;
