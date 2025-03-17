"use client";

import { useEffect, useRef, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './style.css';
import dynamic from 'next/dynamic';
// Import TShirtDesigner class normally since it's not a React component
import TShirtDesigner from './utils/tshirtDesigner';
import { initializeModals } from './utils/modal';
import { AppBar, Toolbar, Typography, IconButton, Box, Paper, Modal } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  border: 'none',
  padding: '6px',
  borderRadius: '4px',
  cursor: 'pointer',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(4px)',
  },
  transition: 'all 0.2s',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
}));

function Designer() {
  const designerRef = useRef<TShirtDesigner | null>(null);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isShapeModalOpen, setIsShapeModalOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [shapeColor, setShapeColor] = useState('#000000');
  const [shapeStrokeColor, setShapeStrokeColor] = useState('#000000');
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState(2);
  const [importError, setImportError] = useState<string | null>(null);
  const [showObjectMenu, setShowObjectMenu] = useState(false);

  useEffect(() => {
    // Initialize TShirtDesigner
    designerRef.current = new TShirtDesigner();

    // Thêm callback khi chọn/bỏ chọn đối tượng
    if (designerRef.current) {
      designerRef.current.onSelectObject = (hasSelection) => {
        setShowObjectMenu(hasSelection);
      };
    }

    // Initialize modals
    initializeModals();

    // Thêm xử lý phím tắt
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V')) {
        e.preventDefault(); // Ngăn chặn hành vi mặc định
        if (designerRef.current) {
          if (e.key.toLowerCase() === 'c') {
            designerRef.current.copySelectedNode();
          } else if (e.key.toLowerCase() === 'v') {
            designerRef.current.pasteNode();
          }
        }
      }
    };

    // Thêm event listener cho phím tắt
    document.addEventListener('keydown', handleKeyDown);

    // Xử lý sự kiện click cho thumbnail
    const handleThumbnailClick = (e: Event) => {
      const target = e.currentTarget as HTMLDivElement;
      const view = target.getAttribute('data-view');

      // Cập nhật active state
      document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
      });
      target.classList.add('active');

      // Chuyển đổi ảnh và stage
      const frontImage = document.getElementById('frontImage') as HTMLImageElement;
      const backImage = document.getElementById('backImage') as HTMLImageElement;
      const previewFront = document.getElementById('preview-front');
      const previewBack = document.getElementById('preview-back');

      if (view === 'front') {
        if (frontImage && backImage) {
          frontImage.style.display = 'block';
          backImage.style.display = 'none';
        }
        if (previewFront && previewBack) {
          previewFront.style.display = 'block';
          previewBack.style.display = 'none';
        }
        if (designerRef.current) {
          designerRef.current.switchToStage('front');
        }
      } else {
        if (frontImage && backImage) {
          frontImage.style.display = 'none';
          backImage.style.display = 'block';
        }
        if (previewFront && previewBack) {
          previewFront.style.display = 'none';
          previewBack.style.display = 'block';
        }
        if (designerRef.current) {
          designerRef.current.switchToStage('back');
        }
      }
    };

    // Thêm event listeners
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', handleThumbnailClick);
    });

    // Cleanup function
    return () => {
      if (designerRef.current) {
        // Add any cleanup code here if needed
      }
      // Remove event listeners
      thumbnails.forEach(thumb => {
        thumb.removeEventListener('click', handleThumbnailClick);
      });
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const colors = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#616161', '#f0f0f0', '#5b5b5b', '#222222', '#fc8d74',
    '#432d26', '#eead91', '#806355', '#382d21', '#faef93',
    '#aeba5e', '#8aa140', '#1f6522', '#13afa2', '#b8d5d7',
    '#15aeda', '#a5def8', '#0f77c0', '#3469b7', '#c50404'
  ];

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: 'rgb(243 244 246)', borderBottom: '1px solid rgb(229 231 235)' }}>
        <Toolbar variant="dense" sx={{ padding: '8px' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'rgb(31 41 55)' }}>
            Design Functions
          </Typography>
        </Toolbar>
      </AppBar>

      <Box className="w-full">
        <Box className="relative">
          <Paper
            id="rightMenu"
            elevation={3}
            sx={{
              position: 'fixed',
              left: 0,
              top: '45px',
              bottom: 0,
              width: '60px',
              backgroundColor: '#18044c',
              py: 1,
              px: 0.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              zIndex: 10,
            }}
          >
            <StyledButton
              onClick={() => setIsColorModalOpen(true)}
              id="color"
            >
              <i className="fas fa-palette text-base"></i>
              <Typography variant="caption" sx={{ fontSize: '10px' }}>Colors</Typography>
            </StyledButton>
            <button className="bg-transparent border-none p-1.5 rounded cursor-pointer text-white hover:bg-white/10 hover:translate-x-1 transition-all flex flex-col items-center gap-0.5">
              <label id="uploadFromPC" className="cursor-pointer flex flex-col items-center gap-0.5">
                <i className="fas fa-images text-base"></i>
                <span className="text-[10px]">Images</span>
                <input
                  type="file"
                  id="file-select"
                  name="file-select"
                  className="hidden"
                  accept="image/jpeg"
                />
              </label>
            </button>
            <button
              id="addingText"
              data-modal-target="editorTextModal"
              data-modal-toggle="editorTextModal"
              className="bg-transparent border-none p-1.5 rounded cursor-pointer text-white hover:bg-white/10 hover:translate-x-1 transition-all flex flex-col items-center gap-0.5"
            >
              <i className="fas fa-font text-base"></i>
              <span className="text-[10px]">Text</span>
            </button>
            <StyledButton
              onClick={() => setIsShapeModalOpen(true)}
              id="shape"
            >
              <i className="fas fa-shapes text-base"></i>
              <Typography variant="caption" sx={{ fontSize: '10px' }}>Shapes</Typography>
            </StyledButton>
            <button
              type="button"
              id="import"
              onClick={() => setIsImportModalOpen(true)}
              className="bg-transparent border-none p-1.5 rounded cursor-pointer text-white hover:bg-white/10 hover:translate-x-1 transition-all flex flex-col items-center gap-0.5"
            >
              <i className="fas fa-upload text-base"></i>
              <span className="text-[10px]">Import</span>
            </button>
            <button
              type="button"
              id="export"
              onClick={() => setIsExportModalOpen(true)}
              className="bg-transparent border-none p-1.5 rounded cursor-pointer text-white hover:bg-white/10 hover:translate-x-1 transition-all flex flex-col items-center gap-0.5"
            >
              <i className="fas fa-download text-base"></i>
              <span className="text-[10px]">Export</span>
            </button>
          </Paper>

          <Box
            component="section"
            id="editorImage"
            sx={{
              pl: '60px',
              pr: '60px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 'calc(100vh - 45px)',
            }}
          >
            <Box sx={{ position: 'relative', maxWidth: '600px', mx: 'auto' }}>
              <Box
                component="img"
                className="frontImage"
                id="frontImage"
                src="/img/crew_front.png"
                alt=""
                sx={{
                  height: 'auto',
                  width: 'auto',
                  maxHeight: '80vh',
                }}
              />
              <div id="preview-front"></div>
              <div id="preview-back"></div>
              <Box
                component="img"
                className="backImage hidden"
                id="backImage"
                src="/img/crew_back.png"
                alt=""
                sx={{
                  height: 'auto',
                  width: 'auto',
                  maxHeight: '80vh',
                }}
              />
            </Box>
          </Box>

          {/* Menu điều chỉnh đối tượng */}
          <Paper
            elevation={3}
            sx={{
              position: 'fixed',
              left: '50%',
              bottom: '20px',
              transform: 'translateX(-50%)',
              backgroundColor: '#18044c',
              py: 1,
              px: 2,
              display: showObjectMenu ? 'flex' : 'none',
              flexDirection: 'row',
              gap: 2,
              zIndex: 10,
              borderRadius: '8px',
            }}
          >
            <button
              type="button"
              id="copy"
              onClick={() => {
                if (designerRef.current) {
                  designerRef.current.copySelectedNode();
                }
              }}
              className="bg-transparent border-none p-1.5 rounded cursor-pointer text-white hover:bg-white/10 transition-all flex flex-col items-center gap-0.5"
            >
              <i className="fas fa-copy text-base"></i>
              <span className="text-[10px]">Copy</span>
            </button>
            <button
              type="button"
              id="paste"
              onClick={() => {
                if (designerRef.current) {
                  designerRef.current.pasteNode();
                }
              }}
              className="bg-transparent border-none p-1.5 rounded cursor-pointer text-white hover:bg-white/10 transition-all flex flex-col items-center gap-0.5"
            >
              <i className="fas fa-paste text-base"></i>
              <span className="text-[10px]">Paste</span>
            </button>
            <button
              type="button"
              id="rotate"
              className="bg-transparent border-none p-1.5 rounded cursor-pointer text-white hover:bg-white/10 transition-all flex flex-col items-center gap-0.5"
            >
              <i className="fas fa-sync-alt text-base"></i>
              <span className="text-[10px]">Rotate</span>
            </button>
            <button
              type="button"
              id="delete"
              className="bg-transparent border-none p-1.5 rounded cursor-pointer text-white hover:bg-white/10 transition-all flex flex-col items-center gap-0.5"
            >
              <i className="fas fa-trash text-base"></i>
              <span className="text-[10px]">Delete</span>
            </button>
          </Paper>

          <Paper
            id="leftMenu"
            elevation={3}
            sx={{
              position: 'fixed',
              right: 0,
              top: '45px',
              bottom: 0,
              width: '60px',
              backgroundColor: '#f8ecfc',
              py: 1,
              px: 0.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              zIndex: 10,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box className="thumbnail active" data-view="front"
                onClick={(e) => {
                  const target = e.currentTarget as HTMLDivElement;
                  const view = target.getAttribute('data-view');

                  // Cập nhật active state
                  document.querySelectorAll('.thumbnail').forEach(thumb => {
                    thumb.classList.remove('active');
                  });
                  target.classList.add('active');

                  // Chuyển đổi ảnh và stage
                  const frontImage = document.getElementById('frontImage') as HTMLImageElement;
                  const backImage = document.getElementById('backImage') as HTMLImageElement;
                  const previewFront = document.getElementById('preview-front');
                  const previewBack = document.getElementById('preview-back');

                  if (view === 'front') {
                    if (frontImage && backImage) {
                      frontImage.style.display = 'block';
                      backImage.style.display = 'none';
                    }
                    if (previewFront && previewBack) {
                      previewFront.style.display = 'block';
                      previewBack.style.display = 'none';
                    }
                    if (designerRef.current) {
                      designerRef.current.switchToStage('front');
                    }
                  }
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  cursor: 'pointer',
                  marginBottom: '50px'
                }}>
                <Box
                  component="img"
                  src="/img/crew_front.png"
                  alt="Front View"
                  sx={{
                    width: '40px',
                    height: '40px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: '10px', textAlign: 'center', color: 'rgb(55 65 81)' }}>
                  Front
                </Typography>
              </Box>
              <Box className="thumbnail" data-view="back"
                onClick={(e) => {
                  const target = e.currentTarget as HTMLDivElement;
                  const view = target.getAttribute('data-view');

                  // Cập nhật active state
                  document.querySelectorAll('.thumbnail').forEach(thumb => {
                    thumb.classList.remove('active');
                  });
                  target.classList.add('active');

                  // Chuyển đổi ảnh và stage
                  const frontImage = document.getElementById('frontImage') as HTMLImageElement;
                  const backImage = document.getElementById('backImage') as HTMLImageElement;
                  const previewFront = document.getElementById('preview-front');
                  const previewBack = document.getElementById('preview-back');

                  if (view === 'back') {
                    if (frontImage && backImage) {
                      frontImage.style.display = 'none';
                      backImage.style.display = 'block';
                    }
                    if (previewFront && previewBack) {
                      previewFront.style.display = 'none';
                      previewBack.style.display = 'block';
                    }
                    if (designerRef.current) {
                      designerRef.current.switchToStage('back');
                    }
                  }
                }}
                sx={{ display: 'flex', flexDirection: 'column', gap: 0, cursor: 'pointer' }}>
                <Box
                  component="img"
                  src="/img/crew_back.png"
                  alt="Back View"
                  sx={{
                    width: '40px',
                    height: '40px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: '10px', textAlign: 'center', color: 'rgb(55 65 81)' }}>
                  Back
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Modal
        open={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
        aria-labelledby="colorModalLabel"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{
          backgroundColor: 'white',
          borderRadius: 1,
          boxShadow: 24,
          width: '100%',
          maxWidth: 500,
          mx: 2,
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" id="colorModalLabel">
              Choose a color
            </Typography>
            <IconButton
              onClick={() => setIsColorModalOpen(false)}
              sx={{ color: 'text.secondary' }}
            >
              <i className="fas fa-times"></i>
            </IconButton>
          </Box>
          <Box sx={{ p: 3 }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 2
            }}>
              {colors.map((color) => (
                <Box
                  key={color}
                  onClick={() => {
                    if (designerRef.current) {
                      designerRef.current.changeBackgroundColor(color);
                      setIsColorModalOpen(false);
                    }
                  }}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        aria-labelledby="exportModalLabel"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{
          backgroundColor: 'white',
          borderRadius: 1,
          boxShadow: 24,
          width: '100%',
          maxWidth: 400,
          mx: 2,
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" id="exportModalLabel">
              Choose Export Type
            </Typography>
            <IconButton
              onClick={() => setIsExportModalOpen(false)}
              sx={{ color: 'text.secondary' }}
            >
              <i className="fas fa-times"></i>
            </IconButton>
          </Box>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button
              onClick={() => {
                if (designerRef.current) {
                  designerRef.current.exportImages('image');
                  setIsExportModalOpen(false);
                }
              }}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              <i className="fas fa-image"></i>
              Export as Images
            </button>
            <button
              onClick={() => {
                if (designerRef.current) {
                  designerRef.current.exportImages('json');
                  setIsExportModalOpen(false);
                }
              }}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              <i className="fas fa-code"></i>
              Export as JSON
            </button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportError(null);
        }}
        aria-labelledby="importModalLabel"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{
          backgroundColor: 'white',
          borderRadius: 1,
          boxShadow: 24,
          width: '100%',
          maxWidth: 400,
          mx: 2,
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" id="importModalLabel">
              Import Design
            </Typography>
            <IconButton
              onClick={() => {
                setIsImportModalOpen(false);
                setImportError(null);
              }}
              sx={{ color: 'text.secondary' }}
            >
              <i className="fas fa-times"></i>
            </IconButton>
          </Box>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <input
              type="file"
              accept=".json"
              className="hidden"
              id="jsonFileInput"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file && designerRef.current) {
                  try {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      try {
                        await designerRef.current?.importDesignFromJson(event.target?.result as string);
                        setIsImportModalOpen(false);
                        setImportError(null);
                      } catch (error) {
                        setImportError('Invalid design file format');
                      }
                    };
                    reader.readAsText(file);
                  } catch (error) {
                    setImportError('Error reading file');
                  }
                }
              }}
            />
            <label
              htmlFor="jsonFileInput"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fas fa-file-upload"></i>
              Choose JSON File
            </label>
            {importError && (
              <Typography color="error" sx={{ textAlign: 'center', mt: 1 }}>
                {importError}
              </Typography>
            )}
          </Box>
        </Box>
      </Modal>

      <Modal
        open={isShapeModalOpen}
        onClose={() => setIsShapeModalOpen(false)}
        aria-labelledby="shapeModalLabel"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{
          backgroundColor: 'white',
          borderRadius: 1,
          boxShadow: 24,
          width: '100%',
          maxWidth: 800,
          mx: 2,
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" id="shapeModalLabel">
              Add Shape
            </Typography>
            <IconButton
              onClick={() => setIsShapeModalOpen(false)}
              sx={{ color: 'text.secondary' }}
            >
              <i className="fas fa-times"></i>
            </IconButton>
          </Box>
          <Box sx={{ p: 3 }}>
            {/* Preview Area */}
            <Box sx={{
              height: '120px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #e2e8f0'
            }}>
              {selectedShape ? (
                <Box sx={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i
                    className={`fas fa-${selectedShape === 'circle' ? 'circle' :
                        selectedShape === 'rect' ? 'square' :
                          selectedShape === 'triangle' ? 'play fa-rotate-270' :
                            selectedShape === 'star' ? 'star' :
                              selectedShape === 'heart' ? 'heart' :
                                selectedShape === 'diamond' ? 'gem' :
                                  selectedShape === 'hexagon' ? 'hexagon' :
                                    'cloud'
                      }`}
                    style={{
                      fontSize: '45px',
                      color: shapeColor,
                      WebkitTextStroke: `${shapeStrokeWidth}px ${shapeStrokeColor}`,
                    }}
                  />
                </Box>
              ) : (
                <Typography variant="body1" sx={{ color: '#94a3b8' }}>
                  Select a shape to preview
                </Typography>
              )}
            </Box>

            {/* Shape Selection */}
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Select Shape
            </Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: 2
            }}>
              <IconButton
                onClick={() => {
                  setSelectedShape('circle');
                }}
                sx={{
                  backgroundColor: selectedShape === 'circle' ? '#1d4ed8' : '#3b82f6',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#2563eb',
                  },
                  width: '60px',
                  height: '60px',
                }}
              >
                <i className="fas fa-circle"></i>
              </IconButton>

              <IconButton
                onClick={() => {
                  setSelectedShape('rect');
                }}
                sx={{
                  backgroundColor: selectedShape === 'rect' ? '#15803d' : '#22c55e',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#16a34a',
                  },
                  width: '60px',
                  height: '60px',
                }}
              >
                <i className="fas fa-square"></i>
              </IconButton>

              <IconButton
                onClick={() => {
                  setSelectedShape('triangle');
                }}
                sx={{
                  backgroundColor: selectedShape === 'triangle' ? '#7e22ce' : '#a855f7',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#9333ea',
                  },
                  width: '60px',
                  height: '60px',
                }}
              >
                <i className="fas fa-play fa-rotate-270"></i>
              </IconButton>

              <IconButton
                onClick={() => {
                  setSelectedShape('star');
                }}
                sx={{
                  backgroundColor: selectedShape === 'star' ? '#b45309' : '#f59e0b',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#d97706',
                  },
                  width: '60px',
                  height: '60px',
                }}
              >
                <i className="fas fa-star"></i>
              </IconButton>

              <IconButton
                onClick={() => {
                  setSelectedShape('heart');
                }}
                sx={{
                  backgroundColor: selectedShape === 'heart' ? '#b91c1c' : '#ef4444',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#dc2626',
                  },
                  width: '60px',
                  height: '60px',
                }}
              >
                <i className="fas fa-heart"></i>
              </IconButton>

              <IconButton
                onClick={() => {
                  setSelectedShape('diamond');
                }}
                sx={{
                  backgroundColor: selectedShape === 'diamond' ? '#0e7490' : '#06b6d4',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#0891b2',
                  },
                  width: '60px',
                  height: '60px',
                }}
              >
                <i className="fas fa-gem"></i>
              </IconButton>

              <IconButton
                onClick={() => {
                  setSelectedShape('hexagon');
                }}
                sx={{
                  backgroundColor: selectedShape === 'hexagon' ? '#6d28d9' : '#8b5cf6',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#7c3aed',
                  },
                  width: '60px',
                  height: '60px',
                }}
              >
                <i className="fas fa-hexagon"></i>
              </IconButton>

              <IconButton
                onClick={() => {
                  setSelectedShape('cloud');
                }}
                sx={{
                  backgroundColor: selectedShape === 'cloud' ? '#475569' : '#64748b',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#475569',
                  },
                  width: '60px',
                  height: '60px',
                }}
              >
                <i className="fas fa-cloud"></i>
              </IconButton>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Fill Color
              </Typography>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(15, 1fr)',
                gap: 0.5
              }}>
                {colors.map((color) => (
                  <Box
                    key={color}
                    onClick={() => {
                      if (designerRef.current) {
                        designerRef.current.changeShapeColor(color);
                        setShapeColor(color);
                      }
                    }}
                    sx={{
                      width: 25,
                      height: 25,
                      borderRadius: '50%',
                      backgroundColor: color,
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Shape Stroke Color
              </Typography>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(15, 1fr)',
                gap: 0.5
              }}>
                {colors.map((color) => (
                  <Box
                    key={color}
                    onClick={() => {
                      if (designerRef.current) {
                        designerRef.current.changeShapeStrokeColor(color);
                        setShapeStrokeColor(color);
                      }
                    }}
                    sx={{
                      width: 25,
                      height: 25,
                      borderRadius: '50%',
                      backgroundColor: color,
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Shape Stroke Width
              </Typography>
              <input
                type="range"
                min="0"
                max="10"
                defaultValue="2"
                className="w-full"
                onChange={(e) => {
                  const width = Number(e.target.value);
                  if (designerRef.current) {
                    designerRef.current.changeShapeStrokeWidth(width);
                    setShapeStrokeWidth(width);
                  }
                }}
              />
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  if (designerRef.current && selectedShape) {
                    designerRef.current.addShape(selectedShape as any);
                    setIsShapeModalOpen(false);
                    setSelectedShape(null);
                  }
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                disabled={!selectedShape}
                style={{ opacity: selectedShape ? 1 : 0.5 }}
              >
                <i className="fas fa-plus"></i>
                Add Shape
              </button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* EDITOR TEXT */}
      <div
        id="editorTextModal"
        tabIndex={-1}
        aria-labelledby="editorTextModalLabel"
        className="fixed inset-0 z-50 hidden bg-black/50 backdrop-blur-sm"
        role="dialog"
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h5 className="text-xl font-semibold text-center" id="editorTextModalLabel">
                Add Text
              </h5>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                data-modal-hide="editorTextModal"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6" id="editorTextDrawer">
              <div className="space-y-6">
                <div>
                  <textarea
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    id="textInput"
                    rows={3}
                    placeholder="Enter your text here..."
                  ></textarea>
                </div>

                <div id="fontColorPickerWrap">
                  <h5 className="text-lg font-medium mb-3">Text Color</h5>
                  <div id="fontColorPicker">
                    <div className="grid grid-cols-10 gap-1">
                      {colors.map((color) => (
                        <div
                          key={color}
                          className="w-7 h-7 rounded-full cursor-pointer transform hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          data-color={color}
                          onClick={() => {
                            if (designerRef.current) {
                              designerRef.current.changeTextColor(color);
                              const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
                              if (textInput) {
                                textInput.style.color = color;
                              }
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div id="fontStyle">
                  <h5 className="text-lg font-medium mb-3">Font Style</h5>
                  <div className="flex justify-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="boldCheck"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        onChange={(e) => {
                          if (designerRef.current) {
                            const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
                            if (textInput) {
                              textInput.style.fontWeight = e.target.checked ? 'bold' : 'normal';
                              designerRef.current.changeFontStyle(e.target.checked ? 'bold' : 'normal');
                            }
                          }
                        }}
                      />
                      <span>Bold</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="italicCheck"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        onChange={(e) => {
                          if (designerRef.current) {
                            const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
                            if (textInput) {
                              textInput.style.fontStyle = e.target.checked ? 'italic' : 'normal';
                              designerRef.current.changeFontStyle(e.target.checked ? 'italic' : 'normal');
                            }
                          }
                        }}
                      />
                      <span>Italic</span>
                    </label>
                  </div>
                </div>

                <div id="fontFamily">
                  <h5 className="text-lg font-medium mb-3">Font Family</h5>
                  <select
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    id="chooseFontFamily"
                    onChange={(e) => {
                      if (designerRef.current) {
                        designerRef.current.changeFontFamily(e.target.value);
                        const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
                        if (textInput) {
                          textInput.style.fontFamily = e.target.value;
                        }
                      }
                    }}
                  >
                    <option value="Montserrat">Montserrat</option>
                    <option value="Sans Serif">Sans Serif</option>
                    <option value="Arial">Arial</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Trebuchet MS">Trebuchet MS</option>
                    <option value="Arial Black">Arial Black</option>
                    <option value="Impact">Impact</option>
                    <option value="Bookman">Bookman</option>
                    <option value="Garamond">Garamond</option>
                    <option value="Palatino">Palatino</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    id="submitText"
                    onClick={() => {
                      const text = (document.getElementById('textInput') as HTMLTextAreaElement).value.trim();
                      if (text && designerRef.current) {
                        designerRef.current.addText(text);
                        const modalElement = document.getElementById('editorTextModal');
                        if (modalElement) {
                          modalElement.classList.add('hidden');
                        }
                      }
                    }}
                  >
                    Add Text
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 z-50 hidden items-center justify-center" role="status">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );
}

export default Designer;
