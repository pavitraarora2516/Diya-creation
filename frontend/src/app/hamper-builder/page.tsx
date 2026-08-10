'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Gift, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

// Dynamically import ThreeHamperBuilder to prevent SSR errors
const ThreeHamperBuilder = dynamic(() => import('../../components/ThreeHamperBuilder'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] md:h-[450px] flex items-center justify-center bg-obsidian-900/30 rounded-lg">
      <span className="text-gold-400 animate-pulse font-serif tracking-widest text-xs">LOADING 3D BLUEPRINT...</span>
    </div>
  ),
});

export default function HamperBuilder() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { addToCart } = useCartStore();

  // Catalog data
  const [boxes, setBoxes] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Builder Wizard State
  const [step, setStep] = useState(1);
  const [selectedBox, setSelectedBox] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [wrapping, setWrapping] = useState('Standard Wrap');
  const [ribbonColor, setRibbonColor] = useState('Gold');
  const [greetingMsg, setGreetingMsg] = useState('');
  const [greetingImg, setGreetingImg] = useState('');
  const [success, setSuccess] = useState(false);

  // Load boxes and components from API
  useEffect(() => {
    async function loadData() {
      try {
        const [boxesRes, compsRes] = await Promise.all([
          api.get<any[]>('/hampers/boxes'),
          api.get<any[]>('/hampers/components'),
        ]);
        setBoxes(boxesRes);
        setComponents(compsRes);
        if (boxesRes.length > 0) {
          setSelectedBox(boxesRes[0]); // Default to first box
        }
      } catch (e) {
        console.error('Failed to load hamper components', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-gold-400 font-serif tracking-widest animate-pulse">BOOTING 3D BUILDER...</div>
        </div>
        <Footer />
      </div>
    );
  }

  // Helpers
  const totalItemsCount = Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
  const capacityLimit = selectedBox?.capacity || 0;

  // Calculate dynamic price
  const boxPrice = selectedBox?.price || 0.0;
  const itemsPrice = Object.entries(selectedItems).reduce((sum, [id, qty]) => {
    const comp = components.find((c) => c.id === id);
    return sum + (comp ? comp.price * qty : 0.0);
  }, 0.0);
  const totalPrice = boxPrice + itemsPrice;

  // Increment item count with capacity check
  const handleAddItem = (compId: string) => {
    const comp = components.find((c) => c.id === compId);
    if (!comp) return;

    if (totalItemsCount >= capacityLimit) {
      alert(`The selected box is full! Maximum capacity is ${capacityLimit} units.`);
      return;
    }

    if (comp.stock <= (selectedItems[compId] || 0)) {
      alert(`Only ${comp.stock} units of ${comp.name} are available.`);
      return;
    }

    setSelectedItems((prev) => ({
      ...prev,
      [compId]: (prev[compId] || 0) + 1,
    }));
  };

  // Decrement item count
  const handleRemoveItem = (compId: string) => {
    if (!selectedItems[compId]) return;
    setSelectedItems((prev) => {
      const next = { ...prev };
      next[compId]--;
      if (next[compId] <= 0) delete next[compId];
      return next;
    });
  };

  // Maps selected items to 3D representation
  const get3DItems = () => {
    return Object.entries(selectedItems).map(([id, qty]) => {
      const comp = components.find((c) => c.id === id);
      return {
        type: comp?.type || 'CHOCOLATE',
        quantity: qty,
      };
    });
  };

  // Maps box name to 3D type
  const get3DBoxType = () => {
    if (!selectedBox) return 'obsidian_box';
    if (selectedBox.name.includes('Gold')) return 'gold_chest';
    if (selectedBox.name.includes('Pine') || selectedBox.name.includes('Wood')) return 'wood_box';
    return 'obsidian_box';
  };

  // Submit hamper to database and cart
  const handleBuildAndCheckout = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (totalItemsCount === 0) {
      alert('Please add at least one chocolate or gift to your hamper box.');
      return;
    }

    try {
      const payload = {
        boxId: selectedBox.id,
        wrapping,
        ribbonColor,
        greetingMsg: greetingMsg || undefined,
        greetingImg: greetingImg || undefined,
        items: Object.entries(selectedItems).map(([id, qty]) => ({
          componentId: id,
          quantity: qty,
        })),
      };

      const res = await api.post<any>('/hampers/build', payload);
      
      // Add compiled hamper to Zustand cart
      await addToCart(null, res.hamper.id, 1);
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/cart');
      }, 1500);
    } catch (e: any) {
      alert(e.message || 'Failed to assemble hamper');
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-obsidian-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        {/* Banner */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-obsidian-50">
            Build Your Own <span className="text-gold-400">Hamper</span>
          </h1>
          <p className="text-obsidian-400 font-light text-xs">
            Follow our step-by-step 3D designer to select your presentation chest, chocolates, and wraps.
          </p>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex justify-center items-center space-x-2 md:space-x-4 mb-10 text-xs font-bold uppercase tracking-wider text-obsidian-500">
          {[
            { n: 1, label: 'Box' },
            { n: 2, label: 'Fillings' },
            { n: 3, label: 'Wrap' },
            { n: 4, label: 'Greeting' },
            { n: 5, label: 'Review' },
          ].map((s) => (
            <React.Fragment key={s.n}>
              <span className={step === s.n ? 'text-gold-400' : step > s.n ? 'text-gold-500/60' : ''}>
                {s.n}. {s.label}
              </span>
              {s.n < 5 && <ChevronRight className="h-3 w-3 text-obsidian-700" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: 3D Preview (Spans 7 cols on large screens) */}
          <div className="lg:col-span-7 space-y-6">
            <ThreeHamperBuilder boxType={get3DBoxType()} ribbonColor={ribbonColor} filledItems={get3DItems()} />
            
            {/* Box Fill Status bar */}
            {selectedBox && (
              <div className="glass-panel p-4 rounded-lg flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-obsidian-300">Tray Capacity</span>
                  <span className="text-[10px] text-obsidian-400 block font-light">
                    {selectedBox.name} limits: {selectedBox.capacity} items max.
                  </span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-sm font-bold text-gold-300">
                    {totalItemsCount} / {selectedBox.capacity} Filled
                  </span>
                  <div className="w-32 bg-obsidian-900 h-2.5 rounded-full overflow-hidden border border-gold-500/10">
                    <div
                      className="bg-gold-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(totalItemsCount / selectedBox.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Options Selector (Spans 5 cols on large screens) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Steps Container */}
            <div className="glass-panel p-6 rounded-lg min-h-[350px] flex flex-col">
              {/* Step 1: Box Style Selection */}
              {step === 1 && (
                <div className="space-y-4 flex-grow">
                  <h3 className="text-xl font-bold font-serif text-gold-300">1. Select A Container Style</h3>
                  <div className="space-y-3">
                    {boxes.map((box) => (
                      <div
                        key={box.id}
                        onClick={() => {
                          setSelectedBox(box);
                          setSelectedItems({}); // reset items to fit new box capacity
                        }}
                        className={`p-4 rounded border cursor-pointer transition-all ${
                          selectedBox?.id === box.id
                            ? 'border-gold-500 bg-gold-500/5'
                            : 'border-gold-500/10 bg-obsidian-900 hover:border-gold-500/30'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-obsidian-100">{box.name}</span>
                          <span className="text-sm font-bold text-gold-300">&#8377; {box.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-bold text-obsidian-400">
                          <span>Dims: {box.dimensions}</span>
                          <span>Fits: {box.capacity} Items</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Fillings (Chocolates & Gifts) */}
              {step === 2 && (
                <div className="space-y-4 flex-grow">
                  <h3 className="text-xl font-bold font-serif text-gold-300">2. Select Chocolates & Gifts</h3>
                  <p className="text-[11px] font-light text-obsidian-400">
                    Add up to {capacityLimit} total units inside your {selectedBox?.name}. Click '+' to add.
                  </p>
                  
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {components.map((comp) => {
                      const qty = selectedItems[comp.id] || 0;
                      return (
                        <div key={comp.id} className="flex items-center justify-between p-3 rounded bg-obsidian-900 border border-gold-500/5">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-obsidian-100 block">{comp.name}</span>
                            <span className="text-[10px] text-gold-400 font-medium block">
                              &#8377; {comp.price.toFixed(2)} &bull; {comp.type}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2.5">
                            <button
                              onClick={() => handleRemoveItem(comp.id)}
                              disabled={qty === 0}
                              className="w-7 h-7 bg-obsidian-950 border border-gold-500/10 rounded flex items-center justify-center text-gold-400 disabled:opacity-30 hover:border-gold-500 transition-colors"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{qty}</span>
                            <button
                              onClick={() => handleAddItem(comp.id)}
                              className="w-7 h-7 bg-obsidian-950 border border-gold-500/10 rounded flex items-center justify-center text-gold-400 hover:border-gold-500 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Ribbon & Wrapping */}
              {step === 3 && (
                <div className="space-y-6 flex-grow">
                  <h3 className="text-xl font-bold font-serif text-gold-300">3. Choose Outer Wrap</h3>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-gold-400 font-medium">Wrapping Style</label>
                    <select
                      value={wrapping}
                      onChange={(e) => setWrapping(e.target.value)}
                      className="w-full bg-obsidian-900 border border-gold-500/10 rounded-md py-2.5 px-4 text-xs text-obsidian-300 outline-none"
                    >
                      <option value="Standard Wrap">Standard Cellophane Wrapping</option>
                      <option value="Silk Tissue Wrap">Luxury Gold Silk Wrapping (+ &#8377; 50.00)</option>
                      <option value="Premium Velvet Wrap">Premium Velvet Wrap (+ &#8377; 100.00)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-gold-400 font-medium">Satin Ribbon Accent</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Gold', 'Red', 'Beige'].map((col) => (
                        <button
                          key={col}
                          onClick={() => setRibbonColor(col)}
                          className={`py-3 rounded border text-xs font-medium transition-all ${
                            ribbonColor === col
                              ? 'border-gold-500 bg-gold-500/5 text-gold-400'
                              : 'border-gold-500/10 bg-obsidian-900 hover:border-gold-500/30'
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Greetings card details */}
              {step === 4 && (
                <div className="space-y-5 flex-grow">
                  <h3 className="text-xl font-bold font-serif text-gold-300">4. Greeting Details</h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-gold-400 font-medium">Card Message (Optional)</label>
                    <textarea
                      rows={3}
                      value={greetingMsg}
                      onChange={(e) => setGreetingMsg(e.target.value)}
                      placeholder="Best wishes on your celebration..."
                      className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2.5 px-4 text-xs text-obsidian-50 outline-none placeholder-obsidian-600 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-gold-400 font-medium">Card Photo URL (Optional)</label>
                    <input
                      type="text"
                      value={greetingImg}
                      onChange={(e) => setGreetingImg(e.target.value)}
                      placeholder="Paste image link (e.g. https://...)"
                      className="w-full bg-obsidian-900 border border-gold-500/10 focus:border-gold-500/40 rounded-md py-2.5 px-4 text-xs text-obsidian-50 outline-none placeholder-obsidian-600"
                    />
                    <p className="text-[10px] text-obsidian-500 font-light">
                      Add a link to a picture (wedding, birthday greeting) to print on the card.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 5: Final Review */}
              {step === 5 && (
                <div className="space-y-6 flex-grow">
                  <h3 className="text-xl font-bold font-serif text-gold-300">5. Review Design</h3>
                  
                  <div className="space-y-3 text-xs font-light text-obsidian-300">
                    <div className="flex justify-between">
                      <span>Presentation Crate:</span>
                      <span className="font-semibold text-obsidian-100">{selectedBox?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wrapping & Accent:</span>
                      <span className="font-semibold text-obsidian-100">
                        {wrapping} ({ribbonColor} Ribbon)
                      </span>
                    </div>
                    {greetingMsg && (
                      <div className="flex justify-between">
                        <span>Custom Greetings Card:</span>
                        <span className="font-semibold text-obsidian-100">Card Attached</span>
                      </div>
                    )}
                    <div className="border-t border-gold-500/10 pt-3">
                      <span className="font-bold text-gold-400 block mb-2 font-serif uppercase tracking-wider text-[10px]">
                        Hamper Content
                      </span>
                      <ul className="space-y-1.5 pl-3 list-disc">
                        {Object.entries(selectedItems).map(([id, qty]) => {
                          const comp = components.find((c) => c.id === id);
                          return (
                            <li key={id}>
                              {comp?.name} x {qty}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation controls */}
              <div className="flex items-center justify-between border-t border-gold-500/10 pt-6 mt-8">
                {step > 1 ? (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="text-xs uppercase tracking-wider font-semibold text-gold-400 flex items-center space-x-1 hover:text-gold-300 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {success ? (
                  <div className="flex items-center space-x-1.5 text-xs text-gold-400 font-semibold uppercase tracking-wider">
                    <CheckCircle2 className="h-4 w-4 text-gold-400" />
                    <span>Assembling Hamper...</span>
                  </div>
                ) : step < 5 ? (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-6 py-2.5 rounded text-xs uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleBuildAndCheckout}
                    className="bg-gold-500 hover:bg-gold-600 text-obsidian-950 font-bold px-8 py-3 rounded text-xs uppercase tracking-wider flex items-center space-x-1.5 gold-glow cursor-pointer"
                  >
                    <Gift className="h-4 w-4" />
                    <span>Add Hamper to Cart</span>
                  </button>
                )}
              </div>
            </div>

            {/* Total Pricing panel */}
            <div className="glass-panel p-6 rounded-lg flex items-center justify-between border border-gold-500/20">
              <span className="text-sm font-bold uppercase tracking-wider text-obsidian-300 font-serif">
                Estimated Price
              </span>
              <span className="text-2xl font-bold text-gold-300">&#8377; {totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
