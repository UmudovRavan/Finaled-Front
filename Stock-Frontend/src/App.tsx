import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import {
  ThemeProvider,
  LanguageProvider,
  AuthProvider,
  StockEntryProvider,
  PurchaseReceiptProvider,
  DeliveryNoteProvider,
  MaterialRequestProvider,
  PickListProvider,
  StockReconciliationProvider,
  LandedCostVoucherProvider,
  RepostItemValuationProvider,
  PackingSlipProvider,
  ItemProvider,
  ItemGroupProvider,
  ItemAttributeProvider,
  BrandProvider,
  WarehouseProvider,
  UOMProvider,
  UOMConversionFactorProvider,
  SerialNoProvider,
  BatchProvider,
  SerialAndBatchBundleProvider,
  InventoryDimensionProvider,
  ShippingRuleProvider,
  ItemAlternativeProvider,
  DeliveryTripProvider,
  QualityInspectionTemplateProvider,
} from './context';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <StockEntryProvider>
              <PurchaseReceiptProvider>
                <DeliveryNoteProvider>
                  <MaterialRequestProvider>
                    <PickListProvider>
                      <StockReconciliationProvider>
                        <LandedCostVoucherProvider>
                          <RepostItemValuationProvider>
                            <PackingSlipProvider>
                              <ItemProvider>
                                <ItemGroupProvider>
                                  <ItemAttributeProvider>
                                    <BrandProvider>
                                      <WarehouseProvider>
                                        <UOMProvider>
                                          <UOMConversionFactorProvider>
                                            <SerialNoProvider>
                                              <BatchProvider>
                                                <SerialAndBatchBundleProvider>
                                                  <InventoryDimensionProvider>
                                                    <ShippingRuleProvider>
                                                      <ItemAlternativeProvider>
                                                        <DeliveryTripProvider>
                                                          <QualityInspectionTemplateProvider>
                                                            <AppRoutes />
                                                          </QualityInspectionTemplateProvider>
                                                        </DeliveryTripProvider>
                                                      </ItemAlternativeProvider>
                                                    </ShippingRuleProvider>
                                                  </InventoryDimensionProvider>
                                                </SerialAndBatchBundleProvider>
                                              </BatchProvider>
                                            </SerialNoProvider>
                                          </UOMConversionFactorProvider>
                                        </UOMProvider>
                                      </WarehouseProvider>
                                    </BrandProvider>
                                  </ItemAttributeProvider>
                                </ItemGroupProvider>
                              </ItemProvider>
                            </PackingSlipProvider>
                          </RepostItemValuationProvider>
                        </LandedCostVoucherProvider>
                      </StockReconciliationProvider>
                    </PickListProvider>
                  </MaterialRequestProvider>
                </DeliveryNoteProvider>
              </PurchaseReceiptProvider>
            </StockEntryProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;

