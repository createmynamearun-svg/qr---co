import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Bell, Search, Volume2, VolumeX, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockTables, mockOrders, mockWaiterCalls, systemSettings, Table, Order, WaiterCall } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const WaiterDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tables] = useState<Table[]>(mockTables);
  const [orders] = useState<Order[]>(mockOrders);
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>(mockWaiterCalls);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTables = tables.filter((table) =>
    table.table_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCalls = waiterCalls.filter((c) => c.status === 'pending');

  const handleAcknowledgeCall = (callId: string) => {
    setWaiterCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, status: 'acknowledged' as const } : c))
    );
    toast({
      title: 'Call Acknowledged',
      description: 'The customer has been notified.',
    });
  };

  const handleResolveCall = (callId: string) => {
    setWaiterCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, status: 'resolved' as const } : c))
    );
    toast({
      title: 'Call Resolved',
      description: 'The call has been marked as resolved.',
    });
  };

  const getTableStatus = (table: Table) => {
    const tableOrder = orders.find((o) => o.table_number === table.table_number && o.status !== 'completed');
    if (tableOrder) {
      return tableOrder.status;
    }
    return table.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'bg-muted border-muted';
      case 'occupied':
        return 'bg-primary/10 border-primary/30';
      case 'ordering':
        return 'bg-info/10 border-info/30';
      case 'pending':
        return 'bg-warning/10 border-warning/30';
      case 'preparing':
        return 'bg-info/10 border-info/30';
      case 'ready':
        return 'bg-success/10 border-success/30';
      case 'waiting':
        return 'bg-warning/10 border-warning/30';
      default:
        return 'bg-muted border-muted';
    }
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    return mins < 1 ? 'Just now' : `${mins}m ago`;
  };

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
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <h1 className="font-bold">Waiter Dashboard</h1>
                  <p className="text-xs text-muted-foreground">
                    {pendingCalls.length} pending calls
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Waiter Calls */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-warning" />
                  Waiter Calls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence>
                  {pendingCalls.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No pending calls</p>
                    </div>
                  ) : (
                    pendingCalls.map((call) => (
                      <motion.div
                        key={call.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <Card className="border-warning/30 bg-warning/5">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="outline" className="font-bold">
                                {call.table_number}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {getTimeAgo(call.created_at)}
                              </span>
                            </div>
                            <p className="text-sm mb-3">{call.reason}</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleAcknowledgeCall(call.id)}
                              >
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Acknowledge
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 bg-success hover:bg-success/90"
                                onClick={() => handleResolveCall(call.id)}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Resolve
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Tables Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tables Overview</CardTitle>
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tables..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredTables.map((table) => {
                    const status = getTableStatus(table);
                    const tableOrder = orders.find(
                      (o) => o.table_number === table.table_number && o.status !== 'completed'
                    );

                    return (
                      <motion.div
                        key={table.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card className={`cursor-pointer card-hover border-2 ${getStatusColor(status)}`}>
                          <CardContent className="p-4 text-center">
                            <h3 className="font-bold text-lg mb-1">{table.table_number}</h3>
                            <Badge variant="secondary" className="text-xs mb-2">
                              {table.capacity} seats
                            </Badge>
                            <p className="text-xs text-muted-foreground capitalize">{status}</p>
                            {tableOrder && (
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-xs font-medium">
                                  {systemSettings.currency_symbol}{tableOrder.total_amount}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
                  {[
                    { status: 'idle', label: 'Available', color: 'bg-muted' },
                    { status: 'occupied', label: 'Occupied', color: 'bg-primary' },
                    { status: 'pending', label: 'Order Pending', color: 'bg-warning' },
                    { status: 'preparing', label: 'Preparing', color: 'bg-info' },
                    { status: 'ready', label: 'Ready', color: 'bg-success' },
                  ].map(({ status, label, color }) => (
                    <div key={status} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WaiterDashboard;
