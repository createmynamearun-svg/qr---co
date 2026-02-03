import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, LayoutDashboard, UtensilsCrossed, Grid3X3, Plus, Pencil, Trash2, ArrowLeft, QrCode, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { menuItems as initialMenuItems, mockTables, mockOrders, systemSettings as initialSettings, categories, MenuItem } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSVG } from 'qrcode.react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [settings, setSettings] = useState(initialSettings);
  const [selectedTable, setSelectedTable] = useState(mockTables[0]);

  // New item form state
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Starters',
    image_url: '',
    is_vegetarian: false,
    prep_time_minutes: '15',
  });

  const handleSaveSettings = () => {
    toast({
      title: 'Settings Saved',
      description: 'Restaurant settings have been updated.',
    });
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const item: MenuItem = {
      id: Date.now().toString(),
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price),
      category: newItem.category,
      image_url: newItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      is_available: true,
      is_vegetarian: newItem.is_vegetarian,
      prep_time_minutes: parseInt(newItem.prep_time_minutes) || 15,
    };

    setMenuItems((prev) => [...prev, item]);
    setNewItem({
      name: '',
      description: '',
      price: '',
      category: 'Starters',
      image_url: '',
      is_vegetarian: false,
      prep_time_minutes: '15',
    });
    toast({
      title: 'Item Added',
      description: `${item.name} has been added to the menu.`,
    });
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: 'Item Deleted',
      description: 'Menu item has been removed.',
    });
  };

  const handleToggleAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_available: !item.is_available } : item
      )
    );
  };

  const completedOrders = mockOrders.filter((o) => o.status === 'completed');
  const todayRevenue = completedOrders.reduce((acc, o) => acc + o.total_amount, 0);

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
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h1 className="font-bold">Admin Dashboard</h1>
                  <p className="text-xs text-muted-foreground">
                    Manage your restaurant
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="menu" className="gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="tables" className="gap-2">
              <Grid3X3 className="w-4 h-4" />
              Tables & QR
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Today's Revenue</p>
                  <p className="text-3xl font-bold text-primary">
                    {settings.currency_symbol}{todayRevenue}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-success/5 border-success/20">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Orders Today</p>
                  <p className="text-3xl font-bold text-success">{mockOrders.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-info/5 border-info/20">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Active Tables</p>
                  <p className="text-3xl font-bold text-info">
                    {mockTables.filter((t) => t.status !== 'idle').length}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-warning/5 border-warning/20">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Menu Items</p>
                  <p className="text-3xl font-bold text-warning">{menuItems.length}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add New Item */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Menu Item
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Item name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Price *</Label>
                      <Input
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prep Time (min)</Label>
                      <Input
                        type="number"
                        value={newItem.prep_time_minutes}
                        onChange={(e) => setNewItem({ ...newItem, prep_time_minutes: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(v) => setNewItem({ ...newItem, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter((c) => c !== 'All').map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={newItem.image_url}
                      onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newItem.is_vegetarian}
                      onCheckedChange={(v) => setNewItem({ ...newItem, is_vegetarian: v })}
                    />
                    <Label>Vegetarian</Label>
                  </div>
                  <Button className="w-full" onClick={handleAddItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </CardContent>
              </Card>

              {/* Menu Items List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Menu Items ({menuItems.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {menuItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          className="flex items-center gap-4 p-3 rounded-lg border bg-card"
                        >
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{item.name}</h4>
                              {item.is_vegetarian && (
                                <Badge className="bg-success text-success-foreground text-xs">Veg</Badge>
                              )}
                              {!item.is_available && (
                                <Badge variant="secondary">Unavailable</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                            <p className="font-medium text-primary">
                              {settings.currency_symbol}{item.price}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.is_available}
                              onCheckedChange={() => handleToggleAvailability(item.id)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tables & QR Tab */}
          <TabsContent value="tables">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tables List */}
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {mockTables.map((table) => (
                      <Button
                        key={table.id}
                        variant={selectedTable.id === table.id ? 'default' : 'outline'}
                        className="h-auto py-4 flex-col"
                        onClick={() => setSelectedTable(table)}
                      >
                        <span className="font-bold text-lg">{table.table_number}</span>
                        <span className="text-xs opacity-70">{table.capacity} seats</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* QR Code Generator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    QR Code - {selectedTable.table_number}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl mb-4">
                    <QRCodeSVG
                      value={`${window.location.origin}/order?table=${selectedTable.table_number}`}
                      size={200}
                      level="H"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Scan to order from {selectedTable.table_number}
                  </p>
                  <Button variant="outline">
                    Download QR Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Restaurant Name</Label>
                    <Input
                      value={settings.restaurant_name}
                      onChange={(e) => setSettings({ ...settings, restaurant_name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Currency Symbol</Label>
                      <Input
                        value={settings.currency_symbol}
                        onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tax Rate (%)</Label>
                      <Input
                        type="number"
                        value={settings.tax_rate}
                        onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Service Charge (%)</Label>
                    <Input
                      type="number"
                      value={settings.service_charge}
                      onChange={(e) => setSettings({ ...settings, service_charge: parseFloat(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleSaveSettings}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
