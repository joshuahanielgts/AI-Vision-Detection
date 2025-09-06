import streamlit as st
import cv2
import numpy as np
from ultralytics import YOLO
import time
from PIL import Image
import io

# Configure Streamlit page
st.set_page_config(
    page_title="AI Vision Detection - Live Webcam",
    page_icon="🎥",
    layout="wide"
)

# Title and description
st.title("🎥 AI Vision Detection - Live Webcam")
st.markdown("Real-time object detection using YOLOv8 and your webcam")

# Sidebar for controls
st.sidebar.title("⚙️ Settings")

@st.cache_resource
def load_model():
    """Load YOLO model with caching"""
    return YOLO('yolov8n.pt')

# Load model
try:
    model = load_model()
    st.sidebar.success("✅ Model loaded successfully!")
except Exception as e:
    st.sidebar.error(f"❌ Failed to load model: {e}")
    st.stop()

# Sidebar controls
confidence = st.sidebar.slider(
    "Confidence Threshold", 
    min_value=0.1, 
    max_value=1.0, 
    value=0.5, 
    step=0.05,
    help="Minimum confidence score for object detection"
)

camera_index = st.sidebar.selectbox(
    "Camera Selection",
    options=[0, 1, 2],
    index=0,
    help="Select camera index (0 is usually the default webcam)"
)

show_statistics = st.sidebar.checkbox("Show Live Statistics", value=True)
save_screenshots = st.sidebar.checkbox("Enable Screenshot Saving", value=False)

# Main interface
col1, col2 = st.columns([3, 1])

with col1:
    st.subheader("📹 Live Feed")
    frame_placeholder = st.empty()

with col2:
    st.subheader("📊 Statistics")
    stats_placeholder = st.empty()
    
    # Control buttons
    start_button = st.button("▶️ Start Detection", type="primary")
    stop_button = st.button("⏹️ Stop Detection")
    screenshot_button = st.button("📸 Take Screenshot")

# Session state for controlling the webcam
if 'detection_running' not in st.session_state:
    st.session_state.detection_running = False
if 'detection_stats' not in st.session_state:
    st.session_state.detection_stats = {'total': 0, 'objects': {}}
if 'frame_count' not in st.session_state:
    st.session_state.frame_count = 0

# Functions
def update_statistics(results):
    """Update detection statistics"""
    if results[0].boxes is not None:
        for box in results[0].boxes:
            class_id = int(box.cls.cpu().numpy()[0])
            class_name = model.names[class_id]
            conf = float(box.conf.cpu().numpy()[0])
            
            if conf >= confidence:
                st.session_state.detection_stats['total'] += 1
                if class_name in st.session_state.detection_stats['objects']:
                    st.session_state.detection_stats['objects'][class_name] += 1
                else:
                    st.session_state.detection_stats['objects'][class_name] = 1

def display_statistics():
    """Display current statistics"""
    if show_statistics:
        with stats_placeholder.container():
            st.metric("Total Detections", st.session_state.detection_stats['total'])
            st.metric("Frames Processed", st.session_state.frame_count)
            
            if st.session_state.detection_stats['objects']:
                st.write("**Detected Objects:**")
                for obj, count in st.session_state.detection_stats['objects'].items():
                    st.write(f"• {obj}: {count}")

def save_frame_as_image(frame, filename):
    """Save frame as image file"""
    cv2.imwrite(filename, frame)
    return filename

# Start detection
if start_button:
    st.session_state.detection_running = True

if stop_button:
    st.session_state.detection_running = False

# Main detection loop
if st.session_state.detection_running:
    try:
        # Initialize camera
        cap = cv2.VideoCapture(camera_index)
        
        if not cap.isOpened():
            st.error(f"❌ Unable to access camera {camera_index}")
            st.session_state.detection_running = False
        else:
            # Set camera properties
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            
            # Detection loop
            fps_counter = 0
            start_time = time.time()
            
            while st.session_state.detection_running:
                ret, frame = cap.read()
                if not ret:
                    st.error("❌ Failed to grab frame from camera")
                    break
                
                st.session_state.frame_count += 1
                fps_counter += 1
                
                # Run YOLO detection
                results = model(frame, conf=confidence, verbose=False)
                
                # Get annotated frame
                annotated_frame = results[0].plot()
                
                # Update statistics
                update_statistics(results)
                
                # Calculate FPS
                elapsed_time = time.time() - start_time
                if elapsed_time >= 1.0:
                    fps = fps_counter / elapsed_time
                    fps_counter = 0
                    start_time = time.time()
                else:
                    fps = 0
                
                # Add FPS text to frame
                cv2.putText(annotated_frame, f'FPS: {fps:.1f}', 
                           (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                # Convert BGR to RGB for Streamlit
                rgb_frame = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)
                
                # Display frame
                frame_placeholder.image(rgb_frame, channels="RGB", use_column_width=True)
                
                # Update statistics display
                display_statistics()
                
                # Save screenshot if requested
                if screenshot_button and save_screenshots:
                    timestamp = time.strftime("%Y%m%d_%H%M%S")
                    filename = f"webcam_detection_{timestamp}.jpg"
                    save_frame_as_image(annotated_frame, filename)
                    st.success(f"📸 Screenshot saved: {filename}")
                
                # Small delay to prevent overwhelming
                time.sleep(0.1)
            
            # Clean up
            cap.release()
            
    except Exception as e:
        st.error(f"❌ Error during detection: {e}")
        st.session_state.detection_running = False

# Footer with instructions
st.markdown("---")
st.markdown("""
### 📝 Instructions:
1. **Adjust settings** in the sidebar (confidence threshold, camera selection)
2. **Click 'Start Detection'** to begin real-time object detection
3. **Enable statistics** to see live detection counts
4. **Take screenshots** to save detected frames
5. **Click 'Stop Detection'** when finished

### 🎯 Features:
- Real-time YOLOv8 object detection
- Adjustable confidence threshold
- Multiple camera support
- Live statistics tracking
- Screenshot functionality
- FPS monitoring

### 🔧 Troubleshooting:
- Make sure your webcam is connected
- Try different camera indices if detection fails
- Close other applications using the webcam
- Restart the app if needed
""")

# Reset statistics button
if st.sidebar.button("🔄 Reset Statistics"):
    st.session_state.detection_stats = {'total': 0, 'objects': {}}
    st.session_state.frame_count = 0
    st.sidebar.success("Statistics reset!")