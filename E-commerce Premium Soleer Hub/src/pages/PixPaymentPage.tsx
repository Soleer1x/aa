import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Copy, Check, QrCode, Clock } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const PixPaymentPage: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [order, setOrder] = useState<any>(null);

  const pixKey = '0dfadcc1-5e2b-4b9c-a7af-e2cb0766f998';
  const pixCode = `00020126580014br.gov.bcb.pix0136${pixKey}520400005303986540${order?.total || 0}5802BR5925Soleer Hub6009Sao Paulo62070503***6304`;

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    generateQRCode();
  }, [order]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Tempo expirado! Tente novamente.');
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadOrder = async () => {
    if (!orderId) return;
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (orderDoc.exists()) {
      setOrder({ id: orderDoc.id, ...orderDoc.data() });
    }
  };

  const generateQRCode = async () => {
    if (!order) return;
    try {
      const qr = await QRCode.toDataURL(pixCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000',
          light: '#fff'
        }
      });
      setQrCode(qr);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmPayment = async () => {
    if (!orderId) return;

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'paid',
        paidAt: new Date().toISOString()
      });

      toast.success('Pagamento confirmado!');
      navigate('/orders');
    } catch (error) {
      toast.error('Erro ao confirmar pagamento');
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#e50914] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#e50914] text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">Pagamento via PIX</h1>
                <p className="text-white/80">Escaneie o QR Code ou copie o código</p>
              </div>
              <QrCode className="w-12 h-12" />
            </div>
          </div>

          {/* Timer */}
          <div className="bg-yellow-50 border-b border-yellow-100 p-4">
            <div className="flex items-center justify-center gap-2 text-yellow-800">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">
                Tempo restante: {String(minutes).padStart(2, '0')}:
                {String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="p-8">
            {/* Order Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Valor total:</span>
                <span className="text-3xl font-bold text-[#e50914]">
                  R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center mb-6">
              <div className="inline-block bg-white p-4 rounded-2xl shadow-lg">
                {qrCode ? (
                  <img src={qrCode} alt="QR Code PIX" className="w-72 h-72" />
                ) : (
                  <div className="w-72 h-72 bg-gray-100 animate-pulse rounded-lg" />
                )}
              </div>
            </div>

            {/* PIX Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código PIX Copia e Cola:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pixCode}
                  readOnly
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-sm font-mono"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-[#e50914] hover:bg-red-700 text-white px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Como pagar:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Abra o app do seu banco</li>
                <li>Escolha a opção Pix</li>
                <li>Escaneie o QR Code ou cole o código</li>
                <li>Confirme o pagamento</li>
                <li>Clique em "Confirmei o Pagamento" abaixo</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={confirmPayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-colors"
              >
                Confirmei o Pagamento
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
              >
                Voltar para a loja
              </button>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Após o pagamento, seu pedido será processado em até 5 minutos
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
