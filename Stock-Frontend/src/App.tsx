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
  QualityInspectionProvider,
} from './context';
import { AppRoutes } from './routes';
import { IosToastContainer } from './components/IosToastContainer';

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
                                                            <QualityInspectionProvider>
                                                              <AppRoutes />
                                                              <IosToastContainer />
                                                            </QualityInspectionProvider>
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

