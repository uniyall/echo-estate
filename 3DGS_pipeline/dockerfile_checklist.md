1. Pulled nvidia/cuda:12.4.1-devel-ubuntu22.04 image from docker hub
    - Since this was being done in an LXD conatiner, encountered some issues related docker 
2. Tried running the conatiner with this image, got error that I do not have NVIDIA Container Toolkit
    - Installed it https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html
    - Run with --runtime=nvidia --gpus all to enable access to underlying cuda and nvidia driver
3. Now I am able to -it into the container, and it has access to CUDA and nvidia driver `nvidia-smi`
4. Build COLMAP from source 
    this command worked - `cmake .. -GNinja -DCMAKE_BUILD_TYPE=Release -DCUDA_ENABLED=ON -DCUDA_ARCHITECTURES="80" -DCMAKE_CUDA_ARCHITECTURES="80" -DTESTS_ENABLED=OFF -GNinja -DGUI_ENABLED=OFF`
5. Build OPENSPLAT from source 
    - I need to build OPENCV also from source otherwise I will get ABI mimatch while building OPENSPLAT 
    git clone --depth 1 -b 4.5.4 https://github.com/opencv/opencv.git
    mkdir opencv && cd opencv
    cmake -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_INSTALL_PREFIX=/usr/local \
      -DCMAKE_CXX_FLAGS="-D_GLIBCXX_USE_CXX11_ABI=0" \
      -DBUILD_TESTS=OFF \
      -DBUILD_PERF_TESTS=OFF \
      -DBUILD_EXAMPLES=OFF \
      -DBUILD_opencv_apps=OFF \
      ..

      make -j$(nproc)
      make install  




    - I also need to install Libtorch 
        wget https://download.pytorch.org/libtorch/cu124/libtorch-shared-with-deps-2.6.0%2Bcu124.zip
        unzip it

    Built opensplat 
    but need to do this as well later - 
    
    echo "/root/libtorch/lib" > /etc/ld.so.conf.d/libtorch.conf
    ldconfig


apt dependencies - 
```
    git \
    ninja-build \
    build-essential \
    libboost-program-options-dev \
    libboost-graph-dev \
    libboost-system-dev \
    libeigen3-dev \
    libopenimageio-dev \
    openimageio-tools \
    libmetis-dev \
    libgoogle-glog-dev \
    libgtest-dev \
    libgmock-dev \
    libsqlite3-dev \
    libglew-dev \
    qt6-base-dev \
    libqt6opengl6-dev \
    libqt6openglwidgets6 \
    libcgal-dev \
    libceres-dev \
    libsuitesparse-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    libmkl-full-dev \
    libopenexr-dev
    curl \
    wget \ 
    unzip \

```