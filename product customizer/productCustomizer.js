import { LightningElement, api, wire } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import getProductImage from '@salesforce/apex/ProductCustomizerController.getProductImage';

export default class ProductCustomizer extends LightningElement {
    
    @api selectedProductId = '';
    @api initials = '';
    @api selectedColor = '#FFD700';
    @api selectedPosition = 'center';
    
    productImageUrl;
    hasRendered = false;
    
    // 렌더링 후 실행
    renderedCallback() {
        // 최초 1회만 실행
        if (!this.hasRendered && this.hasProductSelected) {
            this.hasRendered = true;
            
            // 위치 기본값 Flow에 전달
            if (this.selectedPosition === 'center') {
                setTimeout(() => {
                    this.dispatchEvent(new FlowAttributeChangeEvent('selectedPosition', 'center'));
                }, 100);
            }
        }
    }
    
    // 제품 이미지 가져오기
    @wire(getProductImage, { productId: '$selectedProductId' })
    wiredProductImage({ data, error }) {
        if (data) {
            this.productImageUrl = data;
            
            // 이미지 로드 완료 후 기본값 전달 ⭐
            setTimeout(() => {
                this.dispatchEvent(new FlowAttributeChangeEvent('selectedPosition', this.selectedPosition));
            }, 200);
            
        } else if (error) {
            console.error('이미지 로딩 에러:', error);
            this.productImageUrl = null;
        }
    }
    
    get hasProductSelected() {
        return this.selectedProductId && this.selectedProductId.length > 0;
    }
    
    get positionOptions() {
        return [
            { label: '왼쪽 가슴', value: 'left-chest' },
            { label: '오른쪽 가슴', value: 'right-chest' },
            { label: '중앙', value: 'center' },
            { label: '등 상단', value: 'back-top' }
        ];
    }
    
    get hasPositionOptions() {
        return this.hasProductSelected && this.positionOptions.length > 0;
    }
    
    get showInitials() {
        return this.initials && this.initials.length > 0;
    }
    
    get positionCoordinates() {
        const coords = {
            'left-chest': { top: '30%', left: '20%', size: '36px' },
            'right-chest': { top: '30%', left: '80%', size: '36px' },
            'center': { top: '50%', left: '50%', size: '42px' },
            'back-top': { top: '20%', left: '50%', size: '38px' }
        };
        return coords[this.selectedPosition] || { top: '50%', left: '50%', size: '36px' };
    }
    
    get initialsStyleString() {
        const pos = this.positionCoordinates;
        return `position: absolute; top: ${pos.top}; left: ${pos.left}; color: ${this.selectedColor}; font-size: ${pos.size}; font-weight: bold; transform: translate(-50%, -50%); text-shadow: 2px 2px 4px rgba(0,0,0,0.3); pointer-events: none;`;
    }
    
    handleProductSelect(event) {
        this.selectedProductId = event.detail.recordId;
        this.selectedPosition = 'center';  // 기본값 설정
        this.hasRendered = false;  // 리셋
        
        this.dispatchEvent(new FlowAttributeChangeEvent('selectedProductId', this.selectedProductId));
        
        // 약간의 딜레이 후 위치 전달 ⭐
        setTimeout(() => {
            this.dispatchEvent(new FlowAttributeChangeEvent('selectedPosition', 'center'));
        }, 300);
    }
    
    handleInitialsChange(event) {
        this.initials = event.target.value.toUpperCase();
        this.dispatchEvent(new FlowAttributeChangeEvent('initials', this.initials));
    }
    
    handleColorChange(event) {
        this.selectedColor = event.detail.value;
        this.dispatchEvent(new FlowAttributeChangeEvent('selectedColor', this.selectedColor));
    }
    
    handlePositionChange(event) {
        this.selectedPosition = event.detail.value;
        this.dispatchEvent(new FlowAttributeChangeEvent('selectedPosition', this.selectedPosition));
    }
}