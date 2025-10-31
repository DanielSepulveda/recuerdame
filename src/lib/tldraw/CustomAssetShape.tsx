import {
  BaseBoxShapeUtil,
  HTMLContainer,
  type RecordProps,
  Rectangle2d,
  resizeBox,
  T,
  type TLBaseShape,
  type TLResizeInfo,
} from "tldraw";

// Define the custom asset shape type
export type CustomAssetShape = TLBaseShape<
  "custom-asset",
  {
    w: number;
    h: number;
    assetId: string;
  }
>;

// Shape utility class for custom assets
export class CustomAssetShapeUtil extends BaseBoxShapeUtil<CustomAssetShape> {
  static override type = "custom-asset" as const;

  // Define the shape's props with validators
  static override props: RecordProps<CustomAssetShape> = {
    w: T.number,
    h: T.number,
    assetId: T.string,
  };

  // Default props when creating a new shape
  override getDefaultProps(): CustomAssetShape["props"] {
    return {
      w: 200,
      h: 200,
      assetId: "",
    };
  }

  // Allow resizing
  override canResize() {
    return true;
  }

  // Disable editing (no text input)
  override canEdit() {
    return false;
  }

  // Define the shape's geometry for hit detection
  getGeometry(shape: CustomAssetShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  // Handle resize operations
  override onResize(
    shape: CustomAssetShape,
    info: TLResizeInfo<CustomAssetShape>
  ) {
    return resizeBox(shape, info);
  }

  // Render the shape
  component(shape: CustomAssetShape) {
    const { assetId, w, h } = shape.props;

    if (!assetId) {
      return (
        <HTMLContainer>
          <div
            style={{
              width: w,
              height: h,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f0f0f0",
              border: "2px dashed #ccc",
              color: "#999",
            }}
          >
            No asset selected
          </div>
        </HTMLContainer>
      );
    }

    return (
      <HTMLContainer>
        <img
          src={`/canvas-assets/${assetId}.png`}
          alt={assetId}
          style={{
            width: w,
            height: h,
            objectFit: "contain",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </HTMLContainer>
    );
  }

  // Render the selection indicator
  indicator(shape: CustomAssetShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
