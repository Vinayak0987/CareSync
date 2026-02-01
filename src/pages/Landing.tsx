import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Heart,
  Video,
  Pill,
  Activity,
  ShoppingBag,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Check,
  Star,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  PhoneCall,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { LanguageSwitcher } from '@/lib/i18n/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function Landing() {
  const { t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleQuickAppointment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/voice/initiate-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('📞 Call initiated! You will receive a call shortly.');
        setIsDialogOpen(false);
        setPhoneNumber('');
      } else {
        toast.error(data.error || 'Failed to initiate call');
      }
    } catch (error) {
      toast.error('Failed to connect to server');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Video,
      title: t('telemedicine'),
      description: t('telemedicineDesc'),
      color: 'bg-sky-100 text-sky-600',
    },
    {
      icon: Activity,
      title: t('healthTracking'),
      description: t('healthTrackingDesc'),
      color: 'bg-rose-100 text-rose-600',
    },
    {
      icon: Pill,
      title: t('digitalPrescriptions'),
      description: t('digitalPrescriptionsDesc'),
      color: 'bg-violet-100 text-violet-600',
    },
    {
      icon: ShoppingBag,
      title: t('medicineDelivery'),
      description: t('medicineDeliveryDesc'),
      color: 'bg-amber-100 text-amber-600',
    },
  ];

  const stats = [
    { value: '10,000+', label: t('activePatients') },
    { value: '500+', label: t('verifiedDoctors') },
    { value: '50,000+', label: t('consultations') },
    { value: '4.9★', label: t('userRating') },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Patient',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      quote: 'CareSync made managing my diabetes so much easier. I can track my sugar levels and consult my doctor without leaving home.',
      rating: 5,
    },
    {
      name: 'Dr. Arun Mehta',
      role: 'General Physician',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
      quote: 'As a doctor, CareSync helps me provide better care to my patients with access to their complete health history.',
      rating: 5,
    },
    {
      name: 'Rajesh Kumar',
      role: 'Patient',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      quote: 'The emergency alert feature literally saved my life when my BP spiked. Got connected to a doctor within minutes!',
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: t('basic'),
      price: t('free'),
      description: 'For individuals starting their health journey',
      features: ['Health tracking', 'Medicine reminders', 'Community access', '1 free consultation/month'],
      popular: false,
    },
    {
      name: t('pro'),
      price: '₹299',
      period: t('perMonth'),
      description: 'For patients needing regular care',
      features: ['Everything in Basic', 'Unlimited consultations', 'Priority appointments', 'Digital prescriptions', 'Medicine delivery discounts'],
      popular: true,
    },
    {
      name: t('family'),
      price: '₹599',
      period: t('perMonth'),
      description: 'Care for the whole family',
      features: ['Everything in Pro', 'Up to 5 family members', 'Family health dashboard', 'Dedicated care manager', '24/7 priority support'],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-display font-bold gradient-text">CareSync</span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('features')}</a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('howItWorks')}</a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('testimonials')}</a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('pricing')}</a>
            </div>

            {/* Language Switcher & CTA Buttons */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="compact" />
              <Link to="/login">
                <Button variant="ghost" size="sm">{t('signIn')}</Button>
              </Link>
              <Link to="/login">
                <Button size="sm" className="btn-hero">{t('getStarted')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                {t('trustedBy')}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
                {t('heroTitle')}{' '}
                <span className="gradient-text">{t('simplified')}</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                {t('heroDescription')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/login">
                  <Button size="lg" className="btn-hero w-full sm:w-auto">
                    {t('startJourney')}
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Video size={18} className="mr-2" />
                  {t('watchDemo')}
                </Button>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white border-green-500">
                      <PhoneCall size={18} className="mr-2" />
                      Quick Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <PhoneCall className="w-5 h-5 text-primary" />
                        Quick Appointment via Call
                      </DialogTitle>
                      <DialogDescription>
                        Enter your phone number and we'll call you to book an appointment instantly!
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">+91</span>
                        <Input
                          type="tel"
                          placeholder="Enter your 10-digit phone number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="flex-1"
                          maxLength={10}
                        />
                      </div>
                      <Button
                        onClick={handleQuickAppointment}
                        disabled={isLoading || phoneNumber.length !== 10}
                        className="w-full btn-hero"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Calling...
                          </>
                        ) : (
                          <>
                            <PhoneCall size={18} className="mr-2" />
                            Call Me Now
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        You'll receive a call from our AI assistant to help you book an appointment
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="text-center sm:text-left"
                  >
                    <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Hero Image/Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl p-8">
                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -left-4 bg-card rounded-xl p-4 shadow-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <Heart size={20} className="text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('heartRate')}</p>
                      <p className="text-lg font-display font-bold">72 bpm</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-4 -right-4 bg-card rounded-xl p-4 shadow-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Video size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Dr. Priya Sharma</p>
                      <p className="text-xs text-success">{t('availableNow')}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Main Card */}
                <div className="bg-card rounded-2xl p-6 shadow-xl border border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
                      alt="Doctor"
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-display font-semibold">Dr. Priya Sharma</p>
                      <p className="text-sm text-primary">Cardiology</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} size={12} className="text-warning fill-warning" />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">4.9</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 btn-hero" size="sm">
                      <Video size={16} className="mr-2" />
                      {t('videoCall')}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              {t('everythingYouNeed')} <span className="gradient-text">{t('betterHealth')}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('featuresDescription')}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              {t('howCareSyncWorks')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('howItWorksDesc')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: t('createAccount'), description: t('createAccountDesc') },
              { step: '02', title: t('bookConsultation'), description: t('bookConsultationDesc') },
              { step: '03', title: t('getCare'), description: t('getCareDesc') },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="text-6xl font-display font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="font-display font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {index < 2 && (
                  <ChevronRight size={24} className="hidden md:block absolute top-8 -right-4 text-primary/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              {t('lovedBy')} <span className="gradient-text">{t('patientsAndDoctors')}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('testimonialsDesc')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-sm"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              {t('simpleTransparent')} <span className="gradient-text">{t('transparentPricing')}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('pricingDesc')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-card rounded-2xl p-6 border shadow-sm ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    {t('mostPopular')}
                  </div>
                )}
                <h3 className="font-display font-semibold text-xl mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-display font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/login">
                  <Button
                    className={`w-full ${plan.popular ? 'btn-hero' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {t('getStarted')}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary via-primary/90 to-teal-600 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
                {t('readyToTakeControl')}
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                {t('ctaDescription')}
              </p>
              <Link to="/login">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  {t('createFreeAccount')}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="currentColor" />
                </div>
                <span className="text-xl font-display font-bold">CareSync</span>
              </div>
              <p className="text-sm text-background/60 mb-4">
                Your trusted partner in digital healthcare. Making quality healthcare accessible to everyone.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                  <Mail size={16} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors">
                  <Phone size={16} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('product')}</h4>
              <ul className="space-y-2 text-sm text-background/60">
                <li><a href="#features" className="hover:text-background transition-colors">{t('features')}</a></li>
                <li><a href="#pricing" className="hover:text-background transition-colors">{t('pricing')}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t('forDoctors')}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t('forHospitals')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('company')}</h4>
              <ul className="space-y-2 text-sm text-background/60">
                <li><a href="#" className="hover:text-background transition-colors">{t('aboutUs')}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t('careers')}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t('blog')}</a></li>
                <li><a href="#" className="hover:text-background transition-colors">{t('contact')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t('contact')}</h4>
              <ul className="space-y-2 text-sm text-background/60">
                <li className="flex items-center gap-2">
                  <Mail size={14} />
                  support@caresync.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={14} />
                  +91 1800-123-4567
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="mt-1" />
                  Mumbai, Maharashtra, India
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-background/60">
              © 2026 CareSync. {t('allRightsReserved')}
            </p>
            <div className="flex gap-6 text-sm text-background/60">
              <a href="#" className="hover:text-background transition-colors">{t('privacyPolicy')}</a>
              <a href="#" className="hover:text-background transition-colors">{t('termsOfService')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
