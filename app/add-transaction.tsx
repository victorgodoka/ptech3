import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ProtectedRoute from './components/ProtectedRoute';
import { useTransactions } from './contexts/TransactionContext';

const AddTransactionContent = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { createTransaction, updateTransaction, transactions, loading } = useTransactions();
  const isEditing = !!id;
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('0,00');
  const [category, setCategory] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [existingReceiptUrl, setExistingReceiptUrl] = useState<string | null>(null);
  const [existingReceiptName, setExistingReceiptName] = useState<string | null>(null);

  // Carregar dados da transação se estiver editando
  useEffect(() => {
    if (isEditing && id) {
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        setTransactionType(transaction.type);
        setTitle(transaction.title);
        setDescription(transaction.description || '');
        setAmount(formatCurrencyInput(transaction.amount));
        setCategory(transaction.category);
        
        // Carregar arquivo anexo se existir
        if (transaction.receiptUrl) {
          setExistingReceiptUrl(transaction.receiptUrl);
          setExistingReceiptName(transaction.receiptName || 'Anexo existente');
        }
      }
    }
  }, [isEditing, id, transactions]);

  const categories = {
    income: ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Prêmios', 'Outros'],
    expense: ['Alimentação', 'Transporte', 'Saúde', 'Educação', 'Entretenimento', 'Compras', 'Contas', 'Outros']
  };

  // Função para formatar o valor em centavos para exibição
  const formatCurrencyInput = (cents: number) => {
    const reais = cents / 100;
    return reais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para lidar com a mudança do valor
  const handleAmountChange = (text: string) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    
    // Se vazio, volta para 0
    if (numbers === '') {
      setAmount('0,00');
      return;
    }
    
    // Converte para número e formata
    const cents = parseInt(numbers);
    const formatted = formatCurrencyInput(cents);
    setAmount(formatted);
  };

  // Função para converter o valor exibido para centavos
  const getAmountInCents = () => {
    const numbers = amount.replace(/\D/g, '');
    return parseInt(numbers) || 0;
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Converter para File object
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const fileObject = new File([blob], file.name, { type: file.mimeType || 'application/octet-stream' });
        
        setReceiptFile(fileObject);
        setReceiptUri(file.uri);
        
        Alert.alert(
          'Arquivo Anexado',
          `${file.name} foi anexado com sucesso!${file.size ? `\nTamanho: ${(file.size / 1024).toFixed(1)} KB` : ''}`
        );
      }
    } catch (error) {
      console.error('Erro ao selecionar documento:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo');
    }
  };



  const pickFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permissão Negada', 'É necessário permitir acesso à galeria para selecionar imagens');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        
        // Converter para File object
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const fileName = `receipt_${Date.now()}.jpg`;
        const fileObject = new File([blob], fileName, { type: 'image/jpeg' });
        
        setReceiptFile(fileObject);
        setReceiptUri(image.uri);
        
        Alert.alert(
          'Imagem Anexada',
          `${fileName} foi anexada com sucesso!`
        );
      }
    } catch (error) {
      console.error('Erro ao selecionar da galeria:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const handleAttachReceipt = () => {
    if (receiptFile) {
      // Se já tem arquivo, mostrar opções
      Alert.alert(
        'Gerenciar Anexo',
        `Arquivo atual: ${receiptFile.name}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Trocar Arquivo', onPress: () => showAttachmentOptions() },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: () => {
              setReceiptFile(null);
              setReceiptUri(null);
              Alert.alert('Removido', 'Anexo removido com sucesso!');
            }
          }
        ]
      );
    } else {
      // Se não tem arquivo, mostrar opções
      showAttachmentOptions();
    }
  };

  const showAttachmentOptions = () => {
    Alert.alert(
      'Anexar Arquivo',
      'Escolha uma opção:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '📁 Arquivos', onPress: pickDocument },
        { text: '📷 Galeria', onPress: pickFromGallery }
      ]
    );
  };

  const handleSave = async () => {
    if (!title || !amount || !category) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const amountInCents = getAmountInCents();
    if (amountInCents <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido');
      return;
    }

    try {
      if (isEditing && id) {
        // Modo de edição
        console.log('💾 Atualizando transação:', id);
        
        await updateTransaction(id, {
          title,
          description,
          amount: amountInCents,
          type: transactionType,
          category,
          receiptFile: receiptFile || undefined
        });

        console.log('✅ Transação atualizada com sucesso!');
        
        Alert.alert(
          'Sucesso',
          'Transação atualizada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        // Modo de criação
        console.log('💾 Iniciando salvamento da transação:', {
          title,
          amount: amountInCents,
          type: transactionType,
          category
        });

        // Timeout de 30 segundos
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 30 segundos')), 30000)
        );

        await Promise.race([
          createTransaction({
            title,
            description,
            amount: amountInCents,
            type: transactionType,
            category,
            date: new Date(),
            receiptFile: receiptFile || undefined
          }),
          timeoutPromise
        ]);

        console.log('✅ Transação salva com sucesso!');
        
        Alert.alert(
          'Sucesso',
          'Transação salva com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => router.push('/dashboard' as any)
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('❌ Erro ao salvar transação:', error);
      Alert.alert('Erro', `Falha ao salvar transação: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Transação' : (transactionType === 'income' ? 'Nova Receita' : 'Nova Despesa')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Transaction Type */}
        <View style={styles.typeContainer}>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              onPress={() => setTransactionType('expense')}
              style={[
                styles.typeButton,
                transactionType === 'expense' && styles.typeButtonActive
              ]}
            >
              <View style={styles.typeButtonContent}>
                <Ionicons 
                  name="arrow-up-outline" 
                  size={20} 
                  color={transactionType === 'expense' ? '#ffffff' : '#94a3b8'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  transactionType === 'expense' && styles.typeButtonTextActive
                ]}>
                  Despesa
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setTransactionType('income')}
              style={[
                styles.typeButton,
                transactionType === 'income' && styles.typeButtonActive
              ]}
            >
              <View style={styles.typeButtonContent}>
                <Ionicons 
                  name="arrow-down-outline" 
                  size={20} 
                  color={transactionType === 'income' ? '#ffffff' : '#94a3b8'} 
                />
                <Text style={[
                  styles.typeButtonText,
                  transactionType === 'income' && styles.typeButtonTextActive
                ]}>
                  Receita
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Title */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Título *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Compra no supermercado"
              placeholderTextColor="#64748b"
            />
          </View>

          {/* Amount */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Valor *</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0,00"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Categoria *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoriesContainer}>
                {categories[transactionType].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Descrição</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Adicione detalhes sobre esta transação..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Attachment */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Anexo</Text>
            <TouchableOpacity 
              style={[styles.attachmentButton, (receiptFile || existingReceiptUrl) && styles.attachmentButtonActive]}
              onPress={handleAttachReceipt}
            >
              <Ionicons 
                name={(receiptFile || existingReceiptUrl) ? "checkmark-circle" : "attach-outline"} 
                size={20} 
                color={(receiptFile || existingReceiptUrl) ? "#10b981" : "#94a3b8"} 
                style={styles.attachmentIcon} 
              />
              <Text style={[styles.attachmentText, (receiptFile || existingReceiptUrl) && styles.attachmentTextActive]}>
                {receiptFile 
                  ? `Anexado: ${receiptFile.name}` 
                  : existingReceiptUrl 
                    ? `Anexo atual: ${existingReceiptName}` 
                    : "Anexar arquivo"}
              </Text>
            </TouchableOpacity>
            
            {/* Novo anexo selecionado */}
            {receiptFile && (
              <View style={styles.attachmentPreview}>
                <View style={styles.attachmentInfo}>
                  <Ionicons name="document" size={16} color="#6b7280" />
                  <Text style={styles.attachmentName}>{receiptFile.name}</Text>
                  <Text style={styles.attachmentSize}>
                    {receiptFile.size ? `${(receiptFile.size / 1024).toFixed(1)} KB` : 'Tamanho desconhecido'}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    setReceiptFile(null);
                    setReceiptUri(null);
                  }}
                  style={styles.removeAttachmentButton}
                >
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}

            {/* Anexo existente (quando editando) */}
            {!receiptFile && existingReceiptUrl && (
              <View style={styles.existingAttachment}>
                <View style={styles.attachmentInfo}>
                  <Ionicons name="document-attach" size={16} color="#00b4d8" />
                  <Text style={styles.existingAttachmentName}>{existingReceiptName}</Text>
                </View>
                <View style={styles.existingAttachmentActions}>
                  <TouchableOpacity 
                    onPress={async () => {
                      try {
                        const { Linking } = await import('react-native');
                        await Linking.openURL(existingReceiptUrl);
                      } catch (error) {
                        Alert.alert('Erro', 'Não foi possível abrir o anexo');
                      }
                    }}
                    style={styles.viewAttachmentButton}
                  >
                    <Ionicons name="eye" size={18} color="#00b4d8" />
                    <Text style={styles.viewAttachmentText}>Ver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      Alert.alert(
                        'Remover Anexo',
                        'Deseja remover o anexo existente? Você pode adicionar um novo.',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Remover',
                            style: 'destructive',
                            onPress: () => {
                              setExistingReceiptUrl(null);
                              setExistingReceiptName(null);
                            }
                          }
                        ]
                      );
                    }}
                    style={styles.removeExistingButton}
                  >
                    <Ionicons name="trash" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity 
            onPress={handleSave} 
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Atualizar Transação' : 'Salvar Transação'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.bottomNavGradient}>
          <View style={styles.bottomNavBlur}>
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => router.push('/dashboard')}
            >
              <Ionicons name="home-outline" size={20} color="#ffffff" />
              <Text style={styles.navLabel}>Início</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => router.push('/transactions')}
            >
              <Ionicons name="bar-chart-outline" size={20} color="#ffffff" />
              <Text style={styles.navLabel}>Transações</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navItem, styles.navItemActive]}
              onPress={() => router.push('/add-transaction')}
            >
              <Ionicons name="add-circle" size={20} color="#ffffff" />
              <Text style={styles.navLabel}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#1e293b',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  typeContainer: {
    marginVertical: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#00b4d8',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94a3b8',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  typeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formContainer: {
    gap: 20,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  textInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#374151',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  categoryButtonActive: {
    backgroundColor: '#00b4d8',
    borderColor: '#00b4d8',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  attachmentIcon: {
    marginRight: 8,
  },
  attachmentText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  saveContainer: {
    marginTop: 32,
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#64748b',
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  bottomNavGradient: {
    backgroundColor: 'rgba(30, 64, 175, 0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'relative',
  },
  bottomNavBlur: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backdropFilter: 'blur(10px)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  navLabel: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500',
  },
  currencySymbol: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  attachmentButtonActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  attachmentTextActive: {
    color: '#10b981',
    fontWeight: '500',
  },
  attachmentPreview: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  attachmentSize: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 8,
  },
  removeAttachmentButton: {
    padding: 4,
  },
  existingAttachment: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00b4d8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  existingAttachmentName: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 8,
    flex: 1,
  },
  existingAttachmentActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  viewAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 180, 216, 0.1)',
    borderRadius: 8,
  },
  viewAttachmentText: {
    fontSize: 13,
    color: '#00b4d8',
    fontWeight: '500',
  },
  removeExistingButton: {
    padding: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
});

export default function AddTransaction() {
  return (
    <ProtectedRoute>
      <AddTransactionContent />
    </ProtectedRoute>
  );
}
