/* eslint-disable import/order */
/* eslint-disable import/no-unresolved */
import Konva from 'konva';
import $ from 'jquery';

interface StageConfig {
  stage: Konva.Stage | null;
  layer: Konva.Layer | null;
  transformer: Konva.Transformer | null;
  selectedNode: Konva.Node | null;
  borderDiv: HTMLDivElement | null;
}

interface DesignInfo {
  backgroundColor: string;
  frontDesign: {
    images: Array<{
      src: string;
      x: number;
      y: number;
      rotation: number;
      scaleX: number;
      scaleY: number;
      width: number;
      height: number;
    }>;
    texts: Array<{
      text: string;
      x: number;
      y: number;
      rotation: number;
      scaleX: number;
      scaleY: number;
      fontFamily: string;
      fontSize: number;
      fontStyle: string;
      fontWeight: string;
      fill: string;
      align: string;
    }>;
    shapes: Array<{
      type: 'circle' | 'rect' | 'triangle';
      x: number;
      y: number;
      rotation: number;
      scaleX: number;
      scaleY: number;
      width?: number;
      height?: number;
      radius?: number;
      fill: string;
      stroke?: string;
      strokeWidth?: number;
    }>;
  };
  backDesign: {
    images: Array<{
      src: string;
      x: number;
      y: number;
      rotation: number;
      scaleX: number;
      scaleY: number;
      width: number;
      height: number;
    }>;
    texts: Array<{
      text: string;
      x: number;
      y: number;
      rotation: number;
      scaleX: number;
      scaleY: number;
      fontFamily: string;
      fontSize: number;
      fontStyle: string;
      fontWeight: string;
      fill: string;
      align: string;
    }>;
    shapes: Array<{
      type: 'circle' | 'rect' | 'triangle';
      x: number;
      y: number;
      rotation: number;
      scaleX: number;
      scaleY: number;
      width?: number;
      height?: number;
      radius?: number;
      fill: string;
      stroke?: string;
      strokeWidth?: number;
    }>;
  };
}

class TShirtDesigner {
  private frontStage: StageConfig = {
    stage: null,
    layer: null,
    transformer: null,
    selectedNode: null,
    borderDiv: null
  };

  private backStage: StageConfig = {
    stage: null,
    layer: null,
    transformer: null,
    selectedNode: null,
    borderDiv: null
  };

  private currentStage: StageConfig;
  private textColor: string = '#000000';
  private fontWeight: string = 'normal';
  private fontStyle: string = 'normal';
  private fontFamily: string = 'Montserrat';
  private backgroundColor: string = '#ffffff';
  private shapeColor: string = '#000000';
  private shapeStrokeColor: string = '#000000';
  private shapeStrokeWidth: number = 2;
  private clipboard: Konva.Node | null = null;
  public onSelectObject: ((hasSelection: boolean) => void) | null = null;

  private updateStagePosition(stageConfig: StageConfig, image: HTMLImageElement) {
    if (!stageConfig.stage || !stageConfig.borderDiv) return;

    const imageWidth = image.offsetWidth;
    const imageHeight = image.offsetHeight;
    const imageRect = image.getBoundingClientRect();

    const oldWidth = stageConfig.stage.width();
    const oldHeight = stageConfig.stage.height();

    const stageWidth = imageWidth * 0.35;
    const stageHeight = imageHeight * 0.4;
    const stageX = imageRect.left + (imageWidth - stageWidth) / 2;
    const stageY = imageRect.top + (imageHeight - stageHeight) / 2 - 50;

    // Cập nhật kích thước và vị trí của stage
    stageConfig.stage.width(stageWidth);
    stageConfig.stage.height(stageHeight);

    // Cập nhật vị trí và kích thước của container
    const container = stageConfig.stage.container();
    container.style.position = 'fixed';
    container.style.left = `${stageX}px`;
    container.style.top = `${stageY}px`;
    container.style.transform = `translate3d(0, 0, 0)`; // Thêm GPU acceleration

    // Cập nhật vị trí và kích thước của borderDiv
    stageConfig.borderDiv.style.width = `${stageWidth}px`;
    stageConfig.borderDiv.style.height = `${stageHeight}px`;
    stageConfig.borderDiv.style.left = `${stageX}px`;
    stageConfig.borderDiv.style.top = `${stageY}px`;
    stageConfig.borderDiv.style.transform = `translate3d(0, 0, 0)`; // Thêm GPU acceleration

    // Cập nhật vị trí và kích thước của tất cả các đối tượng trong stage
    if (stageConfig.layer && oldWidth > 0 && oldHeight > 0) {
        // Tính tỷ lệ thay đổi kích thước
        const scaleX = stageWidth / oldWidth;
        const scaleY = stageHeight / oldHeight;

        stageConfig.layer.children.forEach((node) => {
            if (node instanceof Konva.Transformer) return;

            // Lưu vị trí và kích thước tương đối
            const relativeX = node.x() / oldWidth;
            const relativeY = node.y() / oldHeight;
            
            // Cập nhật vị trí mới dựa trên tỷ lệ
            node.x(relativeX * stageWidth);
            node.y(relativeY * stageHeight);

            // Nếu là text node, điều chỉnh kích thước font
            if (node instanceof Konva.Text) {
                const newFontSize = node.fontSize() * Math.min(scaleX, scaleY);
                node.fontSize(newFontSize);
                const nodeWidth = node.width();
                if (typeof nodeWidth === 'number') {
                    node.width(nodeWidth * scaleX);
                }
            }
            // Nếu là image node, điều chỉnh kích thước
            else if (node instanceof Konva.Image) {
                node.width(node.width() * scaleX);
                node.height(node.height() * scaleY);
            }
        });

        // Vẽ lại layer
        stageConfig.layer.draw();
    }
  }

  constructor() {
    this.currentStage = this.frontStage;
    this.initializeStages();
    this.initializeGlobalEventListeners();

    // Thêm event listener cho window resize và scroll
    const updateStagePositions = () => {
      const frontImage = document.getElementById('frontImage') as HTMLImageElement;
      const backImage = document.getElementById('backImage') as HTMLImageElement;

      if (frontImage && backImage) {
        this.updateStagePosition(this.frontStage, frontImage);
        this.updateStagePosition(this.backStage, backImage);
      }
    };

    window.addEventListener('resize', updateStagePositions);
    window.addEventListener('scroll', updateStagePositions, true);
  }

  private initializeStages() {
    // Khởi tạo stage cho mặt trước
    const frontImage = document.getElementById('frontImage') as HTMLImageElement;
    const backImage = document.getElementById('backImage') as HTMLImageElement;

    const initStages = () => {
      if (frontImage && backImage) {
        console.log('Initializing front stage...'); // Debug log
        // Khởi tạo stage mặt trước
        this.setupStage(this.frontStage, frontImage, 'preview-front');
        if (this.frontStage.stage) {
          this.frontStage.stage.container().style.display = 'block';
        }

        console.log('Initializing back stage...'); // Debug log
        // Khởi tạo stage mặt sau
        this.setupStage(this.backStage, backImage, 'preview-back');
        if (this.backStage.stage) {
          this.backStage.stage.container().style.display = 'none';
        }

        // Đảm bảo currentStage được set đúng
        this.currentStage = this.frontStage;
      }
    };

    // Đảm bảo cả hai ảnh đã được tải xong
    let imagesLoaded = 0;
    const onImageLoad = () => {
      imagesLoaded++;
      console.log('Image loaded:', imagesLoaded); // Debug log
      if (imagesLoaded === 2) {
        initStages();
      }
    };

    if (frontImage.complete) {
      onImageLoad();
    } else {
      frontImage.onload = onImageLoad;
    }

    if (backImage.complete) {
      onImageLoad();
    } else {
      backImage.onload = onImageLoad;
    }
  }

  private initializeGlobalEventListeners() {
    // Handle color selection
    $('#colorDrawer').on('click', '.color-option', (e) => {
      const color = $(e.currentTarget).data('color');
      this.changeBackgroundColor(color);
    });

    // Handle file upload
    $('#file-select').on('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.handleImageUpload(file);
      }
    });

    // Handle rotation
    $('#rotate').on('click', () => {
      if (this.currentStage.selectedNode) {
        this.currentStage.selectedNode.rotate(90);
        this.currentStage.layer!.batchDraw();
      }
    });

    // Handle deletion
    $('#delete').on('click', () => {
      this.deleteSelectedNode();
    });

    // Handle keyboard shortcuts for deletion only
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        this.deleteSelectedNode();
      }
    });
  }

  private setupStage(stageConfig: StageConfig, image: HTMLImageElement, containerId: string) {
    const imageWidth = image.offsetWidth;
    const imageHeight = image.offsetHeight;
    const imageRect = image.getBoundingClientRect();

    const stageWidth = imageWidth * 0.35;
    const stageHeight = imageHeight * 0.4;
    const stageX = imageRect.left + (imageWidth - stageWidth) / 2;
    const stageY = imageRect.top + (imageHeight - stageHeight) / 2 - 50;

    // Tạo border div
    const borderDiv = document.createElement('div');
    borderDiv.style.width = `${stageWidth}px`;
    borderDiv.style.height = `${stageHeight}px`;
    borderDiv.style.position = 'fixed';
    borderDiv.style.left = `${stageX}px`;
    borderDiv.style.top = `${stageY}px`;
    borderDiv.style.border = '1px solid black';
    borderDiv.style.pointerEvents = 'none';
    borderDiv.style.display = 'none';
    document.body.appendChild(borderDiv);
    stageConfig.borderDiv = borderDiv;

    // Set style cho stage container
    const previewContainer = document.getElementById(containerId);
    if (previewContainer) {
        previewContainer.style.position = 'fixed';
        previewContainer.style.left = `${stageX}px`;
        previewContainer.style.top = `${stageY}px`;
        previewContainer.style.zIndex = '1';
        previewContainer.style.pointerEvents = 'auto';
    }

    // Khởi tạo stage
    stageConfig.stage = new Konva.Stage({
        container: containerId,
        width: stageWidth,
        height: stageHeight,
    });

    stageConfig.layer = new Konva.Layer();
    stageConfig.stage.add(stageConfig.layer);

    // Khởi tạo transformer
    stageConfig.transformer = new Konva.Transformer();
    stageConfig.layer.add(stageConfig.transformer);

    this.initializeStageEventListeners(stageConfig);
    
    // Draw layer
    stageConfig.layer.draw();
    console.log('Stage setup complete for:', containerId); // Debug log
  }

  public switchToStage(side: 'front' | 'back') {
    console.log('Switching to', side, 'stage'); // Debug log
    console.log('Current stage before switch:', this.currentStage === this.frontStage ? 'front' : 'back');

    // Ẩn stage hiện tại và border
    if (this.currentStage.stage) {
      const currentContainer = this.currentStage.stage.container();
      currentContainer.style.display = 'none';
      currentContainer.style.zIndex = '0';
      console.log('Hidden current stage container');
    }
    if (this.currentStage.borderDiv) {
      this.currentStage.borderDiv.style.display = 'none';
    }
    if (this.currentStage.transformer) {
      this.currentStage.transformer.nodes([]);
    }
    this.currentStage.selectedNode = null;

    // Chuyển đổi stage hiện tại
    this.currentStage = side === 'front' ? this.frontStage : this.backStage;
    console.log('Stage switched to:', side);

    // Cập nhật kích thước và vị trí của stage mới
    const image = document.getElementById(side === 'front' ? 'frontImage' : 'backImage') as HTMLImageElement;
    if (image) {
      this.updateStagePosition(this.currentStage, image);
      console.log('Stage position updated for:', side);
    }

    // Hiện stage mới và cập nhật layer
    if (this.currentStage.stage) {
      const container = this.currentStage.stage.container();
      container.style.display = 'block';
      container.style.zIndex = '1';
      container.style.pointerEvents = 'auto';
      console.log('New stage container display:', container.style.display);
      
      if (this.currentStage.layer) {
        this.currentStage.layer.draw();
        console.log('Layer drawn for new stage');
      }
    }

    // Cập nhật hiển thị của ảnh
    const frontImage = document.getElementById('frontImage') as HTMLImageElement;
    const backImage = document.getElementById('backImage') as HTMLImageElement;
    if (frontImage && backImage) {
      if (side === 'front') {
        frontImage.style.display = 'block';
        frontImage.style.zIndex = '0';
        backImage.style.display = 'none';
        backImage.style.zIndex = '0';
      } else {
        frontImage.style.display = 'none';
        frontImage.style.zIndex = '0';
        backImage.style.display = 'block';
        backImage.style.zIndex = '0';
      }
      console.log('Image visibility updated:', side);
    }

    // Reset selection state
    if (this.onSelectObject) {
      this.onSelectObject(false);
    }

    console.log('Switch complete. Current stage is now:', side);
    
    // Log kích thước stage sau khi chuyển đổi
    if (this.currentStage.stage) {
      console.log('Current stage dimensions:', {
        width: this.currentStage.stage.width(),
        height: this.currentStage.stage.height()
      });
    }
  }

  private initializeStageEventListeners(stageConfig: StageConfig) {
    if (!stageConfig.stage || !stageConfig.layer || !stageConfig.transformer) return;

    const transformer = stageConfig.transformer;
    const stage = stageConfig.stage;
    const layer = stageConfig.layer;

    const limitDragBounds = (stage: StageConfig, node: Konva.Node) => {
      // Tính toán kích thước thực của node sau khi scale
      const nodeWidth = Math.abs(node.width() * node.scaleX());
      const nodeHeight = Math.abs(node.height() * node.scaleY());
      const stageX = stage.stage?.x() ?? 0;
      const stageY = stage.stage?.y() ?? 0;
      const stageWidth = stage.stage?.width() ?? 0;
      const stageHeight = stage.stage?.height() ?? 0;

      console.log(node.getType());
     
      if (node instanceof Konva.Text) {
        const nodeWidthDividedBy2 = nodeWidth / 2;
        const nodeHeightDividedBy2 = nodeHeight / 2;

        var newX = node.x();
        var newY = node.y();
        if ((newX - nodeWidthDividedBy2) < stageX) {
          newX = stageX + nodeWidthDividedBy2;
        }
        if ((newX + nodeWidthDividedBy2) > (stageX + stageWidth)) {
          newX = (stageX + stageWidth) - nodeWidthDividedBy2;
        }

        if ((newY - nodeHeightDividedBy2) < stageY) {
          newY = stageY + nodeHeightDividedBy2;
        }
        if ((newY + nodeHeightDividedBy2) > (stageY + stageHeight)) {
          newY = (stageY + stageHeight) - nodeHeightDividedBy2;
        }
        
        return {
          x: newX,
          y: newY
        };
      } else if (node instanceof Konva.Image ||node instanceof Konva.Shape){
        var newX = node.x();
        var newY = node.y();
        if (newX < stageX) {
          newX = stageX;
        }
        if ((newX + nodeWidth) > (stageX + stageWidth)) {
          newX = (stageX + stageWidth) - nodeWidth;
        }

        if (newY < stageY) {
          newY = stageY;
        }
        if ((newY + nodeHeight) > (stageY + stageHeight)) {
          newY = (stageY + stageHeight) - nodeHeight;
        }
        
        return {
          x: newX,
          y: newY
        };
      }
  };

    // Xử lý drag events
    layer.on('dragstart', () => {
        if (stageConfig.borderDiv) {
            stageConfig.borderDiv.style.display = 'block';
        }
    });

    layer.on('dragend', () => {
        if (stageConfig.borderDiv) {
            stageConfig.borderDiv.style.display = 'none';
        }
    });

    layer.on('dragmove', (e) => {
        const node = e.target;
        // const pos = node.position();
        const newPos = limitDragBounds(this.currentStage, node);
        node.position(newPos);
    });

    // Xử lý transform events để đảm bảo giới hạn khi transform
    transformer.on('transform', () => {
        const nodes = transformer.nodes();
        if (nodes.length > 0) {
            const node = nodes[0];
            // const pos = node.position();
            const newPos = limitDragBounds(this.currentStage, node);
            node.position(newPos);
        }
    });

    // Xử lý selection
    stage.on('click tap', (e) => {
        if (e.target === stage) {
            transformer.nodes([]);
            stageConfig.selectedNode = null;
            if (this.onSelectObject) {
                this.onSelectObject(false);
            }
            return;
        }

        const clickedNode = e.target;
        stageConfig.selectedNode = clickedNode;
        transformer.nodes([clickedNode]);
        if (this.onSelectObject) {
            this.onSelectObject(true);
        }
    });
  }

  private deleteSelectedNode() {
    if (this.currentStage.selectedNode) {
      this.currentStage.selectedNode.destroy();
      this.currentStage.selectedNode = null;
      this.currentStage.transformer!.nodes([]);
      this.currentStage.layer!.batchDraw();
    }
  }

  public changeBackgroundColor(color: string) {
    this.backgroundColor = color;
    $('#frontImage').css('background-color', color);
    $('#backImage').css('background-color', color);
  }

  private handleImageUpload(file: File) {
    console.log('Uploading image to current stage:', this.currentStage === this.frontStage ? 'front' : 'back'); // Debug log
    if (!this.currentStage.stage || !this.currentStage.layer) {
      console.error('Current stage or layer is not initialized');
      return;
    }

    // Cập nhật kích thước stage trước khi thêm hình ảnh
    const image = document.getElementById(this.currentStage === this.frontStage ? 'frontImage' : 'backImage') as HTMLImageElement;
    if (image) {
      this.updateStagePosition(this.currentStage, image);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Đảm bảo stage có kích thước hợp lệ
        const stageWidth = this.currentStage.stage!.width();
        const stageHeight = this.currentStage.stage!.height();
        
        console.log('Stage dimensions before adding image:', {
          stageWidth,
          stageHeight
        });
        
        if (stageWidth <= 0 || stageHeight <= 0) {
          console.error('Invalid stage dimensions:', stageWidth, stageHeight);
          return;
        }

        // Tính toán kích thước tối đa cho hình ảnh
        const maxWidth = stageWidth * 0.8;  // Giảm xuống 80% kích thước stage
        const maxHeight = stageHeight * 0.8;
        
        // Tính toán tỷ lệ scale để hình ảnh vừa với kích thước tối đa
        let scale = 1;
        if (img.width > maxWidth || img.height > maxHeight) {
          scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        }
        
        // Tính toán vị trí để căn giữa hình ảnh
        const x = (stageWidth - (img.width * scale)) / 2;
        const y = (stageHeight - (img.height * scale)) / 2;
        
        console.log('Image dimensions:', {
          stageWidth,
          stageHeight,
          imgWidth: img.width,
          imgHeight: img.height,
          scale,
          x,
          y
        });

        const imgNode = new Konva.Image({
          image: img,
          x: x,
          y: y,
          width: img.width * scale,
          height: img.height * scale,
          draggable: true,
        });

        this.currentStage.layer!.add(imgNode);
        this.currentStage.layer!.draw();
        console.log('Image added successfully');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  public addText(text: string) {
    console.log('Adding text to current stage:', this.currentStage === this.frontStage ? 'front' : 'back');
    console.log('Font style:', { weight: this.fontWeight, style: this.fontStyle });
    
    if (!this.currentStage.stage || !this.currentStage.layer) {
      console.error('Current stage or layer is not initialized');
      return;
    }

    const textNode = new Konva.Text({
      text: text,
      x: this.currentStage.stage.width() / 2,
      y: this.currentStage.stage.height() / 2,
      fontSize: 20,
      draggable: true,
      fill: this.textColor,
      fontFamily: this.fontFamily,
      fontWeight: this.fontWeight,
      fontStyle: this.fontStyle,
      align: 'center',
      padding: 5,
    });

    // Căn giữa text node
    textNode.offsetX(textNode.width() / 2);
    textNode.offsetY(textNode.height() / 2);

    this.currentStage.layer.add(textNode);
    this.currentStage.layer.draw();
    console.log('Text added successfully with styles:', {
      fontWeight: textNode.attrs.fontWeight,
      fontStyle: textNode.fontStyle()
    });
  }

  public changeTextColor(color: string) {
    this.textColor = color;
  }

  public changeFontStyle(style: string) {
    switch (style) {
      case 'bold':
        this.fontWeight = 'bold';
        this.fontStyle = 'normal';
        break;
      case 'italic':
        this.fontWeight = 'normal';
        this.fontStyle = 'italic';
        break;
      case 'bold-italic':
        this.fontWeight = 'bold';
        this.fontStyle = 'italic';
        break;
      default:
        this.fontWeight = 'normal';
        this.fontStyle = 'normal';
        break;
    }

    console.log('Font style changed:', {
      weight: this.fontWeight,
      style: this.fontStyle
    });

    // Cập nhật text node đang được chọn nếu có
    if (this.currentStage.selectedNode instanceof Konva.Text) {
      this.currentStage.selectedNode.fontStyle(this.fontStyle);
      this.currentStage.selectedNode.attrs.fontWeight = this.fontWeight;
      this.currentStage.layer?.draw();
    }
  }

  public changeFontFamily(fontFamily: string) {
    this.fontFamily = fontFamily;
  }

  public addShape(type: 'circle' | 'rect' | 'triangle' | 'star' | 'heart' | 'diamond' | 'hexagon' | 'cloud') {
    console.log('Adding shape to current stage:', this.currentStage === this.frontStage ? 'front' : 'back');
    if (!this.currentStage.stage || !this.currentStage.layer) {
      console.error('Current stage or layer is not initialized');
      return;
    }

    const centerX = this.currentStage.stage.width() / 2;
    const centerY = this.currentStage.stage.height() / 2;
    const defaultSize = Math.min(this.currentStage.stage.width(), this.currentStage.stage.height()) * 0.2;

    let shape: Konva.Shape | null = null;

    switch (type) {
      case 'circle':
        shape = new Konva.Circle({
          x: centerX,
          y: centerY,
          radius: defaultSize / 2,
          fill: this.shapeColor,
          stroke: this.shapeStrokeColor,
          strokeWidth: this.shapeStrokeWidth,
          draggable: true,
        });
        break;

      case 'rect':
        shape = new Konva.Rect({
          x: centerX - defaultSize / 2,
          y: centerY - defaultSize / 2,
          width: defaultSize,
          height: defaultSize,
          fill: this.shapeColor,
          stroke: this.shapeStrokeColor,
          strokeWidth: this.shapeStrokeWidth,
          draggable: true,
        });
        break;

      case 'triangle':
        shape = new Konva.RegularPolygon({
          x: centerX,
          y: centerY,
          sides: 3,
          radius: defaultSize / 2,
          fill: this.shapeColor,
          stroke: this.shapeStrokeColor,
          strokeWidth: this.shapeStrokeWidth,
          draggable: true,
        });
        break;

      case 'star':
        shape = new Konva.Star({
          x: centerX,
          y: centerY,
          numPoints: 5,
          innerRadius: defaultSize / 4,
          outerRadius: defaultSize / 2,
          fill: this.shapeColor,
          stroke: this.shapeStrokeColor,
          strokeWidth: this.shapeStrokeWidth,
          draggable: true,
        });
        break;

      case 'heart':
        const heartPath = new Konva.Path({
          x: centerX - defaultSize / 2,
          y: centerY - defaultSize / 2,
          data: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
          fill: this.shapeColor,
          stroke: this.shapeStrokeColor,
          strokeWidth: this.shapeStrokeWidth,
          draggable: true,
          scaleX: defaultSize / 24,
          scaleY: defaultSize / 24,
        });
        shape = heartPath;
        break;

      case 'diamond':
        shape = new Konva.RegularPolygon({
          x: centerX,
          y: centerY,
          sides: 4,
          radius: defaultSize / 2,
          fill: this.shapeColor,
          stroke: this.shapeStrokeColor,
          strokeWidth: this.shapeStrokeWidth,
          draggable: true,
          rotation: 45,
        });
        break;

      case 'hexagon':
        shape = new Konva.RegularPolygon({
          x: centerX,
          y: centerY,
          sides: 6,
          radius: defaultSize / 2,
          fill: this.shapeColor,
          stroke: this.shapeStrokeColor,
          strokeWidth: this.shapeStrokeWidth,
          draggable: true,
        });
        break;

      case 'cloud':
        const cloudPath = new Konva.Path({
          x: centerX - defaultSize / 2,
          y: centerY - defaultSize / 2,
          data: 'M25.6,11.9c0-0.2,0-0.4,0-0.6c0-3.3-2.7-6-6-6c-2.4,0-4.5,1.4-5.4,3.4c-0.4-0.1-0.8-0.1-1.2-0.1c-3.3,0-6,2.7-6,6c0,0.2,0,0.4,0,0.6C4.1,15.2,2,17.3,2,20c0,2.8,2.2,5,5,5h18c2.8,0,5-2.2,5-5C30,17.3,27.9,15.2,25.6,11.9z',
          fill: this.shapeColor,
          stroke: this.shapeStrokeColor,
          strokeWidth: this.shapeStrokeWidth,
          draggable: true,
          scaleX: defaultSize / 32,
          scaleY: defaultSize / 32,
        });
        shape = cloudPath;
        break;
    }

    if (shape) {
      this.currentStage.layer.add(shape);
      this.currentStage.layer.draw();
      console.log('Shape added successfully');
    }
  }

  public changeShapeColor(color: string) {
    this.shapeColor = color;
    if (this.currentStage.selectedNode instanceof Konva.Shape) {
      this.currentStage.selectedNode.fill(color);
      this.currentStage.layer?.draw();
    }
  }

  public changeShapeStrokeColor(color: string) {
    this.shapeStrokeColor = color;
    if (this.currentStage.selectedNode instanceof Konva.Shape) {
      this.currentStage.selectedNode.stroke(color);
      this.currentStage.layer?.draw();
    }
  }

  public changeShapeStrokeWidth(width: number) {
    this.shapeStrokeWidth = width;
    if (this.currentStage.selectedNode instanceof Konva.Shape) {
      this.currentStage.selectedNode.strokeWidth(width);
      this.currentStage.layer?.draw();
    }
  }

  public exportDesignToJson(): string {
    const getStageInfo = (stageConfig: StageConfig) => {
      const images: any[] = [];
      const texts: any[] = [];
      const shapes: any[] = [];

      if (stageConfig.layer) {
        stageConfig.layer.children.forEach((node) => {
          if (node instanceof Konva.Image) {
            const imageElement = node.image() as HTMLImageElement;
            images.push({
              src: imageElement.src,
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
              width: node.width(),
              height: node.height()
            });
          } else if (node instanceof Konva.Text) {
            texts.push({
              text: node.text(),
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
              fontFamily: node.fontFamily(),
              fontSize: node.fontSize(),
              fontStyle: node.fontStyle(),
              fontWeight: node.attrs.fontWeight || 'normal',
              fill: node.fill(),
              align: node.align()
            });
          } else if (node instanceof Konva.Circle) {
            shapes.push({
              type: 'circle',
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
              radius: node.radius(),
              fill: node.fill(),
              stroke: node.stroke(),
              strokeWidth: node.strokeWidth()
            });
          } else if (node instanceof Konva.Rect) {
            shapes.push({
              type: 'rect',
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
              width: node.width(),
              height: node.height(),
              fill: node.fill(),
              stroke: node.stroke(),
              strokeWidth: node.strokeWidth()
            });
          } else if (node instanceof Konva.RegularPolygon) {
            if (node.attrs.sides === 3) {
              shapes.push({
                type: 'triangle',
                x: node.x(),
                y: node.y(),
                rotation: node.rotation(),
                scaleX: node.scaleX(),
                scaleY: node.scaleY(),
                radius: node.radius(),
                fill: node.fill(),
                stroke: node.stroke(),
                strokeWidth: node.strokeWidth()
              });
            } else if (node.attrs.sides === 4) {
              shapes.push({
                type: 'diamond',
                x: node.x(),
                y: node.y(),
                rotation: node.rotation(),
                scaleX: node.scaleX(),
                scaleY: node.scaleY(),
                radius: node.radius(),
                fill: node.fill(),
                stroke: node.stroke(),
                strokeWidth: node.strokeWidth()
              });
            } else if (node.attrs.sides === 6) {
              shapes.push({
                type: 'hexagon',
                x: node.x(),
                y: node.y(),
                rotation: node.rotation(),
                scaleX: node.scaleX(),
                scaleY: node.scaleY(),
                radius: node.radius(),
                fill: node.fill(),
                stroke: node.stroke(),
                strokeWidth: node.strokeWidth()
              });
            }
          } else if (node instanceof Konva.Star) {
            shapes.push({
              type: 'star',
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
              innerRadius: node.innerRadius(),
              outerRadius: node.outerRadius(),
              numPoints: node.numPoints(),
              fill: node.fill(),
              stroke: node.stroke(),
              strokeWidth: node.strokeWidth()
            });
          } else if (node instanceof Konva.Path) {
            // Kiểm tra dữ liệu path để xác định loại hình
            const pathData = node.data();
            const type = pathData.includes('M12 21.35l-1.45-1.32C5.4') ? 'heart' : 'cloud';
            shapes.push({
              type: type,
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
              data: node.data(),
              fill: node.fill(),
              stroke: node.stroke(),
              strokeWidth: node.strokeWidth()
            });
          }
        });
      }

      return { images, texts, shapes };
    };

    const designInfo: DesignInfo = {
      backgroundColor: this.backgroundColor,
      frontDesign: getStageInfo(this.frontStage),
      backDesign: getStageInfo(this.backStage)
    };

    return JSON.stringify(designInfo, null, 2);
  }

  public async exportImages(type: 'image' | 'json' = 'image') {
    if (type === 'json') {
      console.log('Exporting design to JSON');
      const jsonContent = this.exportDesignToJson();
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tshirt-design.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    }
    console.log('Exporting design to image');

    const exportStage = async (stageConfig: StageConfig, image: HTMLImageElement, side: 'front' | 'back'): Promise<string> => {
        if (!stageConfig.stage || !stageConfig.layer) return '';
        const frontStageContainer = document.getElementById('preview-front');
        const backStageContainer = document.getElementById('preview-back');
        const frontImage = document.getElementById('frontImage') as HTMLImageElement;
        const backImage = document.getElementById('backImage') as HTMLImageElement;

        if (side === 'front') {
          frontImage.style.display = 'block';
          backImage.style.display = 'none';
          if (frontStageContainer) frontStageContainer.style.display = 'block';
          if (backStageContainer) backStageContainer.style.display = 'none';
      } else {
          frontImage.style.display = 'none';
          backImage.style.display = 'block';
          if (frontStageContainer) frontStageContainer.style.display = 'none';
          if (backStageContainer) backStageContainer.style.display = 'block';
      }

        // Tạo một canvas tạm thời với kích thước của ảnh gốc
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) return '';

        // Set kích thước canvas bằng với kích thước ảnh gốc
        tempCanvas.width = image.naturalWidth;
        tempCanvas.height = image.naturalHeight;

        // Vẽ màu nền
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Vẽ ảnh nền (áo) lên canvas với chế độ blend để giữ lại các phần trong suốt
        ctx.globalCompositeOperation = 'source-atop';
        ctx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);
        ctx.globalCompositeOperation = 'source-over';

        // Tính toán tỷ lệ scale để đưa nội dung stage về đúng vị trí trên ảnh gốc
        const scaleX = image.naturalWidth / image.offsetWidth;
        const scaleY = image.naturalHeight / image.offsetHeight;

        // Lấy vị trí và kích thước của stage
        const stageWidth = stageConfig.stage.width();
        const stageHeight = stageConfig.stage.height();
        const stageRect = stageConfig.stage.container().getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();

        // Tính toán offset để đặt stage đúng vị trí trên ảnh
        const offsetX = (stageRect.left - imageRect.left) * scaleX;
        const offsetY = (stageRect.top - imageRect.top) * scaleY;

        // Tạo một canvas tạm thời cho stage với kích thước cố định
        const stageCanvas = document.createElement('canvas');
        stageCanvas.width = 1000; // Kích thước cố định đủ lớn
        stageCanvas.height = 1000;
        const stageCtx = stageCanvas.getContext('2d');
        if (!stageCtx) return '';

        // Thiết lập transform cho stage canvas
        const scale = Math.min(1000 / stageWidth, 1000 / stageHeight);
        stageCtx.scale(scale, scale);

        // Clone layer và vẽ từng node
        const nodes = Array.from(stageConfig.layer.children);
        for (const node of nodes) {
            if (node instanceof Konva.Transformer) continue;

            // Vẽ node
            if (node instanceof Konva.Text) {
                stageCtx.save();
                stageCtx.font = `${node.fontStyle()} ${node.attrs.fontWeight || 'normal'} ${node.fontSize()}px ${node.fontFamily()}`;
                stageCtx.fillStyle = node.fill() as string;
                stageCtx.textAlign = node.align() as CanvasTextAlign;
                stageCtx.translate(node.x(), node.y());
                stageCtx.rotate(node.rotation() * Math.PI / 180);
                stageCtx.scale(node.scaleX(), node.scaleY());
                stageCtx.fillText(node.text(), 0, 0);
                stageCtx.restore();
            } else if (node instanceof Konva.Image) {
                const nodeImage = node.image();
                if (nodeImage) {
                    stageCtx.save();
                    stageCtx.translate(node.x(), node.y());
                    stageCtx.rotate(node.rotation() * Math.PI / 180);
                    stageCtx.scale(node.scaleX(), node.scaleY());
                    stageCtx.drawImage(
                        nodeImage,
                        0,
                        0,
                        node.width() / node.scaleX(),
                        node.height() / node.scaleY()
                    );
                    stageCtx.restore();
                }
            } else if (node instanceof Konva.Circle) {
                stageCtx.save();
                stageCtx.translate(node.x(), node.y());
                stageCtx.rotate(node.rotation() * Math.PI / 180);
                stageCtx.scale(node.scaleX(), node.scaleY());
                stageCtx.beginPath();
                stageCtx.arc(0, 0, node.radius(), 0, Math.PI * 2);
                stageCtx.fillStyle = node.fill() as string;
                if (node.stroke()) {
                    stageCtx.strokeStyle = node.stroke();
                    stageCtx.lineWidth = node.strokeWidth() || 1;
                    stageCtx.stroke();
                }
                stageCtx.fill();
                stageCtx.restore();
            } else if (node instanceof Konva.Rect) {
                stageCtx.save();
                stageCtx.translate(node.x(), node.y());
                stageCtx.rotate(node.rotation() * Math.PI / 180);
                stageCtx.scale(node.scaleX(), node.scaleY());
                stageCtx.fillStyle = node.fill() as string;
                if (node.stroke()) {
                    stageCtx.strokeStyle = node.stroke();
                    stageCtx.lineWidth = node.strokeWidth() || 1;
                    stageCtx.strokeRect(-node.width() / 2, -node.height() / 2, node.width(), node.height());
                }
                stageCtx.fillRect(-node.width() / 2, -node.height() / 2, node.width(), node.height());
                stageCtx.restore();
            } else if (node instanceof Konva.RegularPolygon) {
                stageCtx.save();
                stageCtx.translate(node.x(), node.y());
                stageCtx.rotate(node.rotation() * Math.PI / 180);
                stageCtx.scale(node.scaleX(), node.scaleY());
                stageCtx.beginPath();
                const sides = node.sides();
                const radius = node.radius();
                stageCtx.moveTo(radius, 0);
                for (let i = 1; i < sides; i++) {
                    const angle = (i * 2 * Math.PI) / sides;
                    stageCtx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
                }
                stageCtx.closePath();
                stageCtx.fillStyle = node.fill() as string;
                if (node.stroke()) {
                    stageCtx.strokeStyle = node.stroke();
                    stageCtx.lineWidth = node.strokeWidth() || 1;
                    stageCtx.stroke();
                }
                stageCtx.fill();
                stageCtx.restore();
            } else if (node instanceof Konva.Star) {
                stageCtx.save();
                stageCtx.translate(node.x(), node.y());
                stageCtx.rotate(node.rotation() * Math.PI / 180);
                stageCtx.scale(node.scaleX(), node.scaleY());
                stageCtx.beginPath();
                const outerRadius = node.outerRadius();
                const innerRadius = node.innerRadius();
                const numPoints = node.numPoints();
                for (let i = 0; i < numPoints * 2; i++) {
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    const angle = (i * Math.PI) / numPoints;
                    if (i === 0) {
                        stageCtx.moveTo(radius * Math.cos(angle), radius * Math.sin(angle));
                    } else {
                        stageCtx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
                    }
                }
                stageCtx.closePath();
                stageCtx.fillStyle = node.fill() as string;
                if (node.stroke()) {
                    stageCtx.strokeStyle = node.stroke();
                    stageCtx.lineWidth = node.strokeWidth() || 1;
                    stageCtx.stroke();
                }
                stageCtx.fill();
                stageCtx.restore();
            } else if (node instanceof Konva.Path) {
                stageCtx.save();
                stageCtx.translate(node.x(), node.y());
                stageCtx.rotate(node.rotation() * Math.PI / 180);
                stageCtx.scale(node.scaleX(), node.scaleY());
                const path = new Path2D(node.data());
                stageCtx.fillStyle = node.fill() as string;
                if (node.stroke()) {
                    stageCtx.strokeStyle = node.stroke();
                    stageCtx.lineWidth = node.strokeWidth() || 1;
                    stageCtx.stroke(path);
                }
                stageCtx.fill(path);
                stageCtx.restore();
            }
        }

        // Tính toán kích thước thực của nội dung stage
        const finalWidth = stageWidth * scale;
        const finalHeight = stageHeight * scale;

        // Vẽ stage canvas lên canvas chính với kích thước và vị trí thích hợp
        ctx.drawImage(
            stageCanvas,
            0, 0, finalWidth, finalHeight, // Vùng nguồn
            offsetX, offsetY, stageWidth * scaleX, stageHeight * scaleY // Vùng đích
        );

        // Trả về dataURL của canvas cuối cùng
        return tempCanvas.toDataURL('image/png');
    };

    // Xuất cả hai mặt
    const frontImage = document.getElementById('frontImage') as HTMLImageElement;
    const backImage = document.getElementById('backImage') as HTMLImageElement;

    try {
        const frontDataURL = await exportStage(this.frontStage, frontImage, 'front');
        const backDataURL = await exportStage(this.backStage, backImage, 'back');

        // Tạo và tải xuống các file
        const downloadImage = (dataURL: string, filename: string) => {
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        if (frontDataURL) {
            downloadImage(frontDataURL, 'tshirt-front.png');
        }
        if (backDataURL) {
            downloadImage(backDataURL, 'tshirt-back.png');
        }
    } catch (error) {
        console.error('Error exporting images:', error);
    }
  }

  // public async importDesignFromJson(jsonContent: string) {
  //   try {
  //     const designInfo: DesignInfo = JSON.parse(jsonContent);

  //     // Đặt màu nền
  //     this.changeBackgroundColor(designInfo.backgroundColor);

  //     // Cập nhật kích thước và vị trí của cả hai stage trước khi import
  //     const frontImage = document.getElementById('frontImage') as HTMLImageElement;
  //     const backImage = document.getElementById('backImage') as HTMLImageElement;
      
  //     if (frontImage && backImage) {
  //       this.updateStagePosition(this.frontStage, frontImage);
  //       this.updateStagePosition(this.backStage, backImage);
  //       console.log('Updated stage positions before import');
  //     }

  //     // Hàm helper để import các đối tượng vào stage
  //     const importToStage = async (stageConfig: StageConfig, design: { images: any[], texts: any[], shapes: any[] }) => {
  //       if (!stageConfig.stage || !stageConfig.layer) {
  //         console.error('Stage or layer not initialized');
  //         return;
  //       }

  //       console.log('Importing to stage:', stageConfig === this.frontStage ? 'front' : 'back');
  //       console.log('Stage dimensions:', {
  //         width: stageConfig.stage.width(),
  //         height: stageConfig.stage.height()
  //       });

  //       // Xóa tất cả các đối tượng hiện tại trên stage (trừ transformer)
  //       const nodes = stageConfig.layer.children.slice();
  //       nodes.forEach(node => {
  //         if (!(node instanceof Konva.Transformer)) {
  //           node.destroy();
  //         }
  //       });

  //       // Import images
  //       for (const imageInfo of design.images) {
  //         const img = new Image();
  //         await new Promise((resolve, reject) => {
  //           img.onload = resolve;
  //           img.onerror = reject;
  //           img.src = imageInfo.src;
  //         });

  //         const imgNode = new Konva.Image({
  //           image: img,
  //           x: imageInfo.x,
  //           y: imageInfo.y,
  //           width: imageInfo.width,
  //           height: imageInfo.height,
  //           rotation: imageInfo.rotation,
  //           scaleX: imageInfo.scaleX,
  //           scaleY: imageInfo.scaleY,
  //           draggable: true,
  //         });

  //         stageConfig.layer.add(imgNode);
  //         console.log('Added image to stage:', {
  //           x: imageInfo.x,
  //           y: imageInfo.y,
  //           width: imageInfo.width,
  //           height: imageInfo.height
  //         });
  //       }

  //       // Import texts
  //       for (const textInfo of design.texts) {
  //         const textNode = new Konva.Text({
  //           text: textInfo.text,
  //           x: textInfo.x,
  //           y: textInfo.y,
  //           rotation: textInfo.rotation,
  //           scaleX: textInfo.scaleX,
  //           scaleY: textInfo.scaleY,
  //           fontFamily: textInfo.fontFamily,
  //           fontSize: textInfo.fontSize,
  //           fontStyle: textInfo.fontStyle,
  //           fontWeight: textInfo.fontWeight,
  //           fill: textInfo.fill,
  //           align: textInfo.align,
  //           draggable: true,
  //         });

  //         stageConfig.layer.add(textNode);
  //         console.log('Added text to stage:', {
  //           text: textInfo.text,
  //           x: textInfo.x,
  //           y: textInfo.y
  //         });
  //       }

  //       // Import shapes
  //       for (const shapeInfo of design.shapes) {
  //         let shape: Konva.Shape | null = null;

  //         switch (shapeInfo.type) {
  //           case 'circle':
  //             shape = new Konva.Circle({
  //               x: shapeInfo.x,
  //               y: shapeInfo.y,
  //               radius: shapeInfo.radius,
  //               fill: shapeInfo.fill,
  //               stroke: shapeInfo.stroke,
  //               strokeWidth: shapeInfo.strokeWidth,
  //               rotation: shapeInfo.rotation,
  //               scaleX: shapeInfo.scaleX,
  //               scaleY: shapeInfo.scaleY,
  //               draggable: true,
  //             });
  //             break;

  //           case 'rect':
  //             shape = new Konva.Rect({
  //               x: shapeInfo.x,
  //               y: shapeInfo.y,
  //               width: shapeInfo.width,
  //               height: shapeInfo.height,
  //               fill: shapeInfo.fill,
  //               stroke: shapeInfo.stroke,
  //               strokeWidth: shapeInfo.strokeWidth,
  //               rotation: shapeInfo.rotation,
  //               scaleX: shapeInfo.scaleX,
  //               scaleY: shapeInfo.scaleY,
  //               draggable: true,
  //             });
  //             break;

  //           case 'triangle':
  //             shape = new Konva.RegularPolygon({
  //               x: shapeInfo.x,
  //               y: shapeInfo.y,
  //               sides: 3,
  //               radius: shapeInfo.radius,
  //               fill: shapeInfo.fill,
  //               stroke: shapeInfo.stroke,
  //               strokeWidth: shapeInfo.strokeWidth,
  //               rotation: shapeInfo.rotation,
  //               scaleX: shapeInfo.scaleX,
  //               scaleY: shapeInfo.scaleY,
  //               draggable: true,
  //             });
  //             break;

  //           case 'star':
  //             shape = new Konva.Star({
  //               x: shapeInfo.x,
  //               y: shapeInfo.y,
  //               numPoints: shapeInfo.numPoints || 5,
  //               innerRadius: shapeInfo.innerRadius,
  //               outerRadius: shapeInfo.outerRadius,
  //               fill: shapeInfo.fill,
  //               stroke: shapeInfo.stroke,
  //               strokeWidth: shapeInfo.strokeWidth,
  //               rotation: shapeInfo.rotation,
  //               scaleX: shapeInfo.scaleX,
  //               scaleY: shapeInfo.scaleY,
  //               draggable: true,
  //             });
  //             break;

  //           case 'diamond':
  //             shape = new Konva.RegularPolygon({
  //               x: shapeInfo.x,
  //               y: shapeInfo.y,
  //               sides: 4,
  //               radius: shapeInfo.radius,
  //               fill: shapeInfo.fill,
  //               stroke: shapeInfo.stroke,
  //               strokeWidth: shapeInfo.strokeWidth,
  //               rotation: shapeInfo.rotation + 45, // Thêm 45 độ để tạo hình thoi
  //               scaleX: shapeInfo.scaleX,
  //               scaleY: shapeInfo.scaleY,
  //               draggable: true,
  //             });
  //             break;

  //           case 'hexagon':
  //             shape = new Konva.RegularPolygon({
  //               x: shapeInfo.x,
  //               y: shapeInfo.y,
  //               sides: 6,
  //               radius: shapeInfo.radius,
  //               fill: shapeInfo.fill,
  //               stroke: shapeInfo.stroke,
  //               strokeWidth: shapeInfo.strokeWidth,
  //               rotation: shapeInfo.rotation,
  //               scaleX: shapeInfo.scaleX,
  //               scaleY: shapeInfo.scaleY,
  //               draggable: true,
  //             });
  //             break;

  //           case 'heart':
  //             shape = new Konva.Path({
  //               x: shapeInfo.x,
  //               y: shapeInfo.y,
  //               data: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  //               fill: shapeInfo.fill,
  //               stroke: shapeInfo.stroke,
  //               strokeWidth: shapeInfo.strokeWidth,
  //               rotation: shapeInfo.rotation,
  //               scaleX: shapeInfo.scaleX,
  //               scaleY: shapeInfo.scaleY,
  //               draggable: true,
  //             });
  //             break;

  //           case 'cloud':
  //             shape = new Konva.Path({
  //               x: shapeInfo.x,
  //               y: shapeInfo.y,
  //               data: 'M25.6,11.9c0-0.2,0-0.4,0-0.6c0-3.3-2.7-6-6-6c-2.4,0-4.5,1.4-5.4,3.4c-0.4-0.1-0.8-0.1-1.2-0.1c-3.3,0-6,2.7-6,6c0,0.2,0,0.4,0,0.6C4.1,15.2,2,17.3,2,20c0,2.8,2.2,5,5,5h18c2.8,0,5-2.2,5-5C30,17.3,27.9,15.2,25.6,11.9z',
  //               fill: shapeInfo.fill,
  //               stroke: shapeInfo.stroke,
  //               strokeWidth: shapeInfo.strokeWidth,
  //               rotation: shapeInfo.rotation,
  //               scaleX: shapeInfo.scaleX,
  //               scaleY: shapeInfo.scaleY,
  //               draggable: true,
  //             });
  //             break;
  //         }

  //         if (shape) {
  //           stageConfig.layer.add(shape);
  //           console.log('Added shape to stage:', {
  //             type: shapeInfo.type,
  //             x: shapeInfo.x,
  //             y: shapeInfo.y
  //           });
  //         }
  //       }

  //       stageConfig.layer.draw();
  //       console.log('Layer drawn for stage:', stageConfig === this.frontStage ? 'front' : 'back');
  //     };

  //     // Import thiết kế cho cả hai mặt
  //     await importToStage(this.frontStage, designInfo.frontDesign);
  //     await importToStage(this.backStage, designInfo.backDesign);

  //     // Cập nhật lại stage hiện tại
  //     const currentSide = this.currentStage === this.frontStage ? 'front' : 'back';
  //     this.switchToStage(currentSide);
  //     console.log('Switched back to current stage:', currentSide);

  //   } catch (error) {
  //     console.error('Error importing design:', error);
  //     throw new Error('Invalid design file format');
  //   }
  // }

  public copySelectedNode() {
    if (!this.currentStage.selectedNode) return;
    
    // Lưu node được chọn vào clipboard
    this.clipboard = this.currentStage.selectedNode.clone();
    console.log('Node copied to clipboard');
  }

  public pasteNode() {
    if (!this.clipboard || !this.currentStage.layer) return;

    // Tạo bản sao từ clipboard
    const clone = this.clipboard.clone();
    
    // Di chuyển vị trí của bản sao để tránh chồng lên bản gốc
    clone.x(clone.x() + 20);
    clone.y(clone.y() + 20);
    
    // Thêm thuộc tính draggable
    clone.draggable(true);
    
    // Thêm vào layer
    this.currentStage.layer.add(clone);
    this.currentStage.layer.draw();
    
    // Chọn node mới được paste
    if (this.currentStage.transformer) {
      this.currentStage.transformer.nodes([clone]);
      this.currentStage.selectedNode = clone;
      if (this.onSelectObject) {
        this.onSelectObject(true);
      }
    }
    
    console.log('Node pasted from clipboard');
  }
}

export default TShirtDesigner; 