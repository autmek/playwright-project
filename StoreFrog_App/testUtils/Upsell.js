const {expect } = require('@playwright/test');
const { 
    higherPricedVariant,
    recom_Products,
} = require('./constants');
const { addToCart,
    Savewidget,
    ReloadandWait_Newpage,
    WidgetIsDisplayed
 } = require('./CommonFunctions');
async function editverify_Title(iframe,page,newPage,widgetID,newtitle){
    const titlebox = await iframe.locator('.Polaris-TextField__Input').first();
    await titlebox.fill(newtitle);
    await Savewidget(iframe,page);
    await ReloadandWait_Newpage(newPage);
    await addToCart(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const widg_title = await newWidg.locator('.sf-widget-title').textContent();
    expect(widg_title).toBe(newtitle); 

}

async function moreQuantity(iframe,page,triggerOption,triggerValue){
    await iframe.getByText(triggerOption).first().click();
    await page.waitForTimeout(3000);
    await iframe.getByRole('button',{name:/Manage/}).click({force:true});
    await page.waitForTimeout(1000);
    const upsellModal = await iframe.locator('.Polaris-Modal-Section');
    let modalcount;
    modalcount = await upsellModal.count();
    if(modalcount===0){
        while(modalcount === 0){
            await iframe.getByRole('button',{name:/Manage/}).click({force:true});
            await page.waitForTimeout(1000); 
            modalcount = await upsellModal.count();     
        } 
    }
    await upsellModal.locator('.Polaris-TextField__Input').fill(triggerValue);
    await page.waitForTimeout(500);
    await upsellModal.getByLabel(triggerValue).locator('.Polaris-Checkbox').click();
    await page.waitForTimeout(1000);
    await iframe.locator('.sf-cs-modal-footer').getByRole('button',{name:'Confirm'}).click();
}

async function sameProductasUpsell(newPage,widgetID,triggerProduct){
    const newWidg = await WidgetIsDisplayed(newPage, widgetID);
    const Upsell = await newWidg.locator('.sf-product-title').textContent();
    expect(Upsell).toBe(triggerProduct);
}

async function higherPriced(iframe,page,triggerOption,triggerValue){
    await iframe.getByText(triggerOption).nth(1).click();
    if(triggerOption!== 'All products'){
        await iframe.getByRole('button',{name:/Manage/}).click({force:true});
        await page.waitForTimeout(1000);
        const upsellModal = await iframe.locator('.Polaris-Modal-Section');
        let modalcount;
        modalcount = await upsellModal.count();
        if(modalcount===0){
            while(modalcount === 0){
                await iframe.getByRole('button',{name:/Manage/}).click({force:true});
                await page.waitForTimeout(1000); 
                modalcount = await upsellModal.count();     
            } 
        }
        await upsellModal.locator('.Polaris-TextField__Input').fill(triggerValue);
        await page.waitForTimeout(500);
        await upsellModal.locator('.Polaris-Checkbox__Input').click();
        await page.waitForTimeout(1000);
        await iframe.locator('.sf-cs-modal-footer').getByRole('button',{name:'Confirm'}).click();
    }
}

async function highestVariantasUpsell(newPage,widgetID){
   const newWidg = await WidgetIsDisplayed(newPage, widgetID);
   const variantOn_widget = await newWidg.locator('.sf-product-variants-dropdown').textContent();
   expect(variantOn_widget).toBe(higherPricedVariant);

}

async function customAll(iframe,page){
    await iframe.getByRole('button',{name:"Next"}).click();
    for(const Recommendation of recom_Products){
        await iframe.locator('.Polaris-TextField__Input').fill(Recommendation);
        await page.waitForTimeout(1000);
        await iframe.locator('.Polaris-Checkbox').click();
        await page.waitForTimeout(1000);
    }
    await iframe.getByRole('button',{name:"Confirm"}).click();
    await iframe.getByRole('button',{name: 'Continue'}).click();
}
async function editverify_subtitle(page,newPage,iframe,Subtitle,widgetID){
    const subtitleBox = await iframe.locator('input.Polaris-TextField__Input').nth(1);
    await subtitleBox.fill(Subtitle);
    await Savewidget(iframe,page);
    await ReloadandWait_Newpage(newPage);
    await addToCart(newPage);
    const newWidg = await WidgetIsDisplayed(newPage, widgetID);
    const discount_onStore = await newWidg.locator('.sf-discount-text').textContent();
    expect(discount_onStore).toBe(Subtitle);
}
async function Discount(iframe,page,en_dis,discount){
    const discountCheckbox = await iframe.locator('.Polaris-Checkbox__Input').nth(3);
    const discountChecked = await discountCheckbox.isChecked();
    if ((en_dis === 'enable' && !discountChecked) ){
        await discountCheckbox.click();
        await iframe.locator('input.Polaris-TextField__Input').nth(2).fill(discount);
        await page.waitForTimeout(1000);
    }else if((en_dis === 'disable' && discountChecked)){
        await discountCheckbox.click();
    }
}

module.exports ={
    moreQuantity,
    sameProductasUpsell,
    higherPriced,
    highestVariantasUpsell,
    editverify_Title,
    customAll,
    editverify_subtitle,
    Discount,
}