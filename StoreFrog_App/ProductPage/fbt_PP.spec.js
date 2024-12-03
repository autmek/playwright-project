const {test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
// Common functions used
const {
    login,
    CreateNewWidget,
    NavigatetoApp,
    FindWidgetID,
    editWidget,
    NavigateToStore,
    WidgetIsDisplayed,
    WidgetNotDisplayed,
    Savewidget,
    ReloadandWait_Newpage,
    RemovePreviousDisplayFilter,
    ApplyDisplayFilter,
    ViewDate,
    UserRole,
    NavigateToPage,
} = require('../testUtils/CommonFunctions');

// FBT function
const{
    deleteAllotherRecommendation,
    setManualRecommendation,
    setAutomaticRecommendation,
    setRandomRecommendation,
    setGlobalRecommendation,
    Price,
    desktop_displayStyle,
    ApplyDiscount,
    discountApplied,
    totalPriceDisplay,
    cartbuttonDisplay,
    cartbuttonText,
    cartbutton_Action,
    cartbutton_Color,
    discountDisplay,
    discountText,
    discountColor,
    editverify_Title,
    Verify_variableToCart,
} = require('../testUtils/FBT');
// Functions for customisation
const {
    totalNumberOf_ProductonWidget,
    titleAlignment,
    titleFont,
    productPriceDisplay,
    product_titleAlignment,
    product_titleFont,
    responsivePreview,
} = require('../testUtils/visualPreference');
const{
    userName, passWord, adminURL, adminTitle, appName,
    productOnstore,Main_product,Secondary_product,Category,Collection,Tag,price,
    total_productsOnFBT,edit_singleCartButton,edit_bothCartButton,edit_allCartButton,
    edit_discountText,triggerProduct,recom_Products,discount_flat,discount_cent,
}= require('../testUtils/constants');
let context, iframe, widgetID, newPage, page, storeURL, newWidg;
const newtitle = 'Updated FBT - PP';
const pageName = 'Product page';

test.beforeAll(async ({browser}) => {
    context = await browser.newContext();
    page = await context.newPage(); 
    await page.goto(adminURL);
    await login(page,userName,passWord,adminTitle); 
    await page.waitForLoadState('load');
    iframe = page.frameLocator('[name=app-iframe]');
    newPage = await NavigateToStore(page);
    storeURL = await newPage.url();
    await page.bringToFront();
    await NavigateToPage(newPage,pageName,storeURL,productOnstore);
});

test.afterAll(async()=>{
    await context.close();
})

// CreateNewWidget
test('Create new FBT widget for Product page', async()=>{
    fs.writeFileSync(path.resolve(__dirname, 'fbtPP.json'), JSON.stringify({}));
    await page.waitForLoadState('load');
    await CreateNewWidget(page,iframe,appName,pageName, 'Frequently bought together');
    widgetID = await FindWidgetID(iframe);
    fs.writeFileSync(path.resolve(__dirname, 'fbtPP.json'), JSON.stringify({ widgetID }));
    await ReloadandWait_Newpage(newPage)
    await WidgetIsDisplayed(newPage, widgetID);
});

test('Edit widget title', async()=>{
    //widgetID = '0081';
    await NavigatetoApp(page,appName);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'fbtPP.json'))); 
        widgetID = data.widgetID;
    }
    await editWidget(iframe,page,widgetID);
    await editverify_Title(iframe,page,newPage,widgetID,newtitle);                 
});

test.describe('Products to recommend', ()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'fbtPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage)
        await WidgetIsDisplayed(newPage,widgetID);
    });

    test.beforeEach(async()=>{
        await deleteAllotherRecommendation(iframe,page);
    });

    test('Manual recommendations', async()=>{
        await setManualRecommendation(iframe,page,triggerProduct,recom_Products);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage)
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);
    })

    test('Automatic recommendation',async()=>{
        await setAutomaticRecommendation(iframe);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,productOnstore);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    const randomFilters = [
        'Same collection', 'Same type', 'Same category',
    ];
    for(const labels of randomFilters){
        test(`Random recommendation: ${labels}`, async()=>{
            await setRandomRecommendation(page,iframe,labels);
            await Savewidget(iframe,page);
            await NavigateToPage(newPage,pageName,storeURL,productOnstore);
            await WidgetIsDisplayed(newPage,widgetID);
        });
    }
    test('Global recommendation', async()=>{
        await setGlobalRecommendation(iframe,page,recom_Products);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,productOnstore);
        await WidgetIsDisplayed(newPage,widgetID);
    });
});
test('Add variable product from widget to cart', async () => {
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'fbtPP.json'))); 
        widgetID = data.widgetID;
    }
    await Verify_variableToCart(newPage,widgetID,storeURL);
});

// DisplayRules
test.describe('Display Rules', async()=>{

    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'fbtPP.json'))); 
            widgetID = data.widgetID;
        }
        await editWidget(iframe,page,widgetID);
        await page.waitForTimeout(3000);
        await RemovePreviousDisplayFilter(iframe);
    });  

    test.afterEach(async()=>{
        await RemovePreviousDisplayFilter(iframe);
        await Savewidget(iframe,page);
    })

    test('Display Rules - Include Category', async()=>{
        await ApplyDisplayFilter(iframe,'Category', 'Include', Category);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Exclude Category', async()=>{
        await ApplyDisplayFilter(iframe,'Category', 'Exclude', Category);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Include Product', async()=>{
        await ApplyDisplayFilter(iframe,'Products', 'Include', Main_product);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Exclude Product', async()=>{
        await ApplyDisplayFilter(iframe, 'Products', 'Exclude', Main_product);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Include Collection', async()=>{
        await ApplyDisplayFilter(iframe, 'Collection', 'Include', Collection);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);

    });
    
    test('Display Rules - Exclude Collection', async()=>{
        await ApplyDisplayFilter(iframe,'Collection', 'Exclude', Collection);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Include Tag', async()=>{
        await ApplyDisplayFilter(iframe, 'Tag', 'Include', Tag);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Exclude Tag', async()=>{
        await ApplyDisplayFilter(iframe, 'Tag', 'Exclude', Tag);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Guest User', async()=>{
        await UserRole(iframe, 'User is guest');
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Customer User', async()=>{
        await UserRole(iframe, 'User is customer');
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await ReloadandWait_Newpage(newPage);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - View Date (Current)', async()=>{
        await ViewDate(iframe,true); //Current date
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
    });

    test('Display Rules - View Date (Future)', async()=>{
        await ViewDate(iframe, false); //Future date
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Price GreaterThan', async()=>{
        await Price(iframe, 'greaterThan', price);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Price LessThan', async()=>{
        await Price(iframe, 'lessThan',price);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetNotDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    
});

test.describe('FBT - Discounts', async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'fbtPP.json'))); 
            widgetID = data.widgetID;
        }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage)
        newWidg = await WidgetIsDisplayed(newPage,widgetID);
        await page.waitForTimeout(3000);
    });

    test('No discount', async()=>{
        const discountTextbox = await iframe.locator('.Polaris-TextField__Input').nth(1);
        await discountTextbox.fill('0');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage)
        await WidgetIsDisplayed(newPage,widgetID);
        const discountText_onStore = await newWidg.locator('.sf-discount-text');
        await expect(discountText_onStore).toBeHidden();
    });

    //Make sure the discount text contains "{discount}" to avoid conflict in the code
    test('Percentage Discount', async()=>{
        const Dtype = await ApplyDiscount(iframe,'percentage',discount_cent);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
        await discountApplied(newWidg,discount_cent,Dtype);
    });

    test('Flat Discount',async()=>{
        const Dtype = await ApplyDiscount(iframe,'flat',discount_flat);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
        await discountApplied(newWidg,discount_flat,Dtype);
    });    
});

// Customize
test.describe('Customise widget', async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'fbtPP.json'))); 
            widgetID = data.widgetID;
        }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage)
        await WidgetIsDisplayed(newPage,widgetID);

        await iframe.locator('.widget-settings-button').click(); //Customize
        await page.waitForTimeout(3000);
    }); 
    test.afterAll(async()=>{
        //Closing customize window
        await iframe.locator('.Polaris-FullscreenBar__BackAction').click();
    });
    test('The total number of products to display', async()=>{    
        await totalNumberOf_ProductonWidget(page,newPage,iframe,widgetID,total_productsOnFBT);
    });
    test('Dislay_Style(On Desktop) - Table', async()=>{    
        await desktop_displayStyle(iframe,page,newPage,widgetID,'Table');
    });

    test('Dislay_Style(On Desktop) - Gallery', async()=>{    
        await desktop_displayStyle(iframe,page,newPage,widgetID,'Gallery');
    });

    test('Dislay_Style(On Desktop) - List', async()=>{    
        await desktop_displayStyle(iframe,page,newPage,widgetID,'List');
    });

    test('Widget title Alignment - Left', async()=>{    
        await titleAlignment(iframe,page,newPage,widgetID,'left');
    });

    test('Widget title Alignment - Center', async()=>{    
        await titleAlignment(iframe,page,newPage,widgetID,'Center');
    });

    test('Widget title Alignment - Right', async()=>{    
        await titleAlignment(iframe,page,newPage,widgetID,'Right');
    });
    
    test('Widget title font color', async()=>{    
        await titleFont(iframe,page,newPage,widgetID);
    });

    test('Product price Display', async()=>{    
        await productPriceDisplay(iframe,page,newPage,widgetID,'disable');
    
        await page.waitForTimeout(2000);

        await productPriceDisplay(iframe,page,newPage,widgetID,'enable');
    });

    test('Total price Display',async()=>{
        await totalPriceDisplay(iframe,page,newPage,widgetID,'disable');
        await page.waitForTimeout(2000);

        await totalPriceDisplay(iframe,page,newPage,widgetID,'enable');
    });

    test('Product title alignment - Left', async()=>{    
        await product_titleAlignment(iframe,page,newPage,widgetID,'left');
    });

    test('Product title alignment - Center', async()=>{    
        await product_titleAlignment(iframe,page,newPage,widgetID,'center');
    });

    test('Product title alignment - Right', async()=>{    
        await product_titleAlignment(iframe,page,newPage,widgetID,'right');
    });
    
    test('Product title font', async()=>{    
        await product_titleFont(iframe,page,newPage,widgetID);
    });
    test('Cart button display', async()=>{    
        await cartbuttonDisplay(iframe,page,newPage,widgetID,'disable');
        await page.waitForTimeout(2000);

        await cartbuttonDisplay(iframe,page,newPage,widgetID,'enable');
    })

    test('Cart button text', async()=>{    
        await cartbuttonText(iframe,page,newPage,widgetID,edit_singleCartButton,edit_bothCartButton,edit_allCartButton);
    });

    test('Cart button action - Redirect to Cart', async()=>{
        await cartbutton_Action(iframe,page,newPage,widgetID,'redirect to cart');
    });

    test('Cart button action - Stay on page', async()=>{
        await cartbutton_Action(iframe,page,newPage,widgetID,'stay on page');
    });
    
    test('Cart button action - Redirect to checkout', async()=>{
        await cartbutton_Action(iframe,page,newPage,widgetID,'redirect to checkout');
    });
    test('Cart button colors', async()=>{
        await cartbutton_Color(iframe,page,newPage,widgetID);
    });

    test('Discount text Display',async()=>{
        await discountDisplay(iframe,page,newPage,widgetID,'disable');
        await page.waitForTimeout(2000);

        await discountDisplay(iframe,page,newPage,widgetID,'enable');

    });

    test('Edit Discount text', async()=>{
        await discountText(iframe,page,newPage,widgetID,edit_discountText);
    });

    test('Discount Color',async()=>{
        await discountColor(iframe,page,newPage,widgetID);
    });

    test('Responsiveness of the preview section', async()=>{    
        await responsivePreview(iframe,page);
    });

});

