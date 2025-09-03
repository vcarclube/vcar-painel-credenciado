import { Input, Output, Conversion, ALL_FORMATS, BlobSource, BufferTarget, Mp4OutputFormat, WebMOutputFormat } from 'mediabunny';

/**
 * Utilitário para compressão de mídia usando MediaBunny
 */
class MediaBunnyCompression {
  constructor() {
    // MediaBunny não precisa de instanciação, usa funções diretamente
  }

  /**
   * Configurações de compressão para vídeos baseadas no tamanho
   */
  getVideoCompressionSettings(fileSize) {
    const sizeMB = fileSize / (1024 * 1024);
    
    if (sizeMB > 200) {
      // Arquivos muito grandes (>200MB) - compressão ultra rápida
      return {
        quality: 0.15,
        maxWidth: 480,
        maxHeight: 270,
        bitrate: '200k',
        format: 'mp4'
      };
    } else if (sizeMB > 100) {
      // Arquivos grandes (100-200MB) - compressão rápida
      return {
        quality: 0.25,
        maxWidth: 640,
        maxHeight: 360,
        bitrate: '250k',
        format: 'mp4'
      };
    } else if (sizeMB > 50) {
      // Arquivos médios (50-100MB) - compressão moderada
      return {
        quality: 0.4,
        maxWidth: 854,
        maxHeight: 480,
        bitrate: '400k',
        format: 'mp4'
      };
    } else if (sizeMB > 25) {
      // Arquivos pequenos (25-50MB) - compressão leve
      return {
        quality: 0.6,
        maxWidth: 1280,
        maxHeight: 720,
        bitrate: '600k',
        format: 'mp4'
      };
    } else {
      // Arquivos muito pequenos não precisam de compressão
      return null;
    }
  }

  /**
   * Configurações de compressão para imagens baseadas no tamanho
   */
  getImageCompressionSettings(fileSize) {
    const sizeMB = fileSize / (1024 * 1024);
    
    if (sizeMB > 5) {
      return {
        quality: 0.6,
        maxWidth: 1920,
        maxHeight: 1080,
        format: 'jpeg'
      };
    } else if (sizeMB > 2) {
      return {
        quality: 0.8,
        maxWidth: 2560,
        maxHeight: 1440,
        format: 'jpeg'
      };
    } else {
      // Imagens pequenas não precisam de compressão
      return null;
    }
  }

  /**
   * Comprime um vídeo usando MediaBunny
   */
  async compressVideo(file, onProgress = null) {
    console.log('🎬 Iniciando compressão de vídeo com MediaBunny...');
    
    const settings = this.getVideoCompressionSettings(file.size);
    
    if (!settings) {
      console.log('📁 Arquivo pequeno, não precisa de compressão');
      return file;
    }

    try {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      console.log(`🔥 Comprimindo vídeo: ${sizeMB}MB`);
      console.log('⚙️ Configurações:', settings);

      // Criar input a partir do arquivo
      const input = new Input({
        source: new BlobSource(file),
        formats: ALL_FORMATS,
      });
      
      // Criar output para compressão
      const output = new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget(),
      });
      
      // Configurar opções de conversão com as configurações corretas para velocidade
      const conversionOptions = {
        input,
        output,
        video: {
          width: settings.maxWidth,
          height: settings.maxHeight,
          fit: 'contain',
          bitrate: parseInt(settings.bitrate.replace('k', '')) * 1000, // Converter para bits/segundo
          codec: 'avc', // H.264 é chamado de 'avc' no MediaBunny
          forceTranscode: true,
          preset: 'ultrafast' // Preset mais rápido para acelerar compressão
        }
      };
      
      // Executar conversão com configurações
      const conversion = await Conversion.init(conversionOptions);
      
      // Configurar callback de progresso detalhado
      if (onProgress) {
        let startTime = Date.now();
        conversion.onProgress = (progress) => {
          const elapsed = Date.now() - startTime;
          const progressPercent = Math.round(progress * 100); // MediaBunny retorna 0-1, converter para 0-100
          const estimated = elapsed / (progress || 0.01); // Evitar divisão por zero
          const remaining = estimated - elapsed;
          
          //console.log(`🔄 Progresso real: ${progressPercent}% - Tempo restante: ${Math.round(remaining / 1000)}s`);
          onProgress(progressPercent);
        };
      }
      
      console.log('⚡ Executando compressão ultra-rápida...');
      await conversion.execute();
      
      // Retornar arquivo comprimido
      const compressedBuffer = output.target.buffer;
      const compressedFile = new File(
        [compressedBuffer],
        `compressed_${file.name.replace(/\.[^/.]+$/, '')}.${settings.format}`,
        { type: `video/${settings.format}` }
      );

      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
      const reductionPercent = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
      
      console.log(`🎯 Compressão de vídeo concluída!`);
      console.log(`📊 ${originalSizeMB}MB → ${compressedSizeMB}MB (${reductionPercent}% redução)`);
      
      return compressedFile;
    } catch (error) {
      console.error('❌ Erro na compressão de vídeo:', error);
      throw error;
    }
  }

  /**
   * Comprime uma imagem usando Canvas API (MediaBunny é mais focado em vídeo)
   */
  async compressImage(file, onProgress = null) {
    console.log('🖼️ Iniciando compressão de imagem com Canvas API...');
    
    const settings = this.getImageCompressionSettings(file.size);
    
    if (!settings) {
      console.log('📁 Imagem pequena, não precisa de compressão');
      return file;
    }

    try {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      console.log(`🔥 Comprimindo imagem: ${sizeMB}MB`);
      console.log('⚙️ Configurações:', settings);

      const compressedFile = await new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // Calcular novas dimensões
          let { width, height } = img;
          if (settings.maxWidth && width > settings.maxWidth) {
            height = (height * settings.maxWidth) / width;
            width = settings.maxWidth;
          }
          if (settings.maxHeight && height > settings.maxHeight) {
            width = (width * settings.maxHeight) / height;
            height = settings.maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Desenhar imagem redimensionada
          ctx.drawImage(img, 0, 0, width, height);
          
          // Converter para blob com qualidade especificada
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File(
                  [blob],
                  `compressed_${file.name.replace(/\.[^/.]+$/, '')}.${settings.format}`,
                  { type: `image/${settings.format}` }
                );
                resolve(compressedFile);
              } else {
                reject(new Error('Falha na compressão da imagem'));
              }
            },
            `image/${settings.format}`,
            settings.quality
          );
        };
        
        img.onerror = () => reject(new Error('Falha ao carregar imagem'));
        img.src = URL.createObjectURL(file);
      });

      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
      const reductionPercent = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
      
      console.log(`🎯 Compressão de imagem concluída!`);
      console.log(`📊 ${originalSizeMB}MB → ${compressedSizeMB}MB (${reductionPercent}% redução)`);
      
      return compressedFile;
    } catch (error) {
      console.error('❌ Erro na compressão de imagem:', error);
      throw error;
    }
  }

  /**
   * Comprime um arquivo automaticamente baseado no tipo
   */
  async compressFile(file, onProgress = null) {
    if (file.type.startsWith('video/')) {
      return await this.compressVideo(file, onProgress);
    } else if (file.type.startsWith('image/')) {
      return await this.compressImage(file, onProgress);
    } else {
      console.log('📄 Tipo de arquivo não suportado para compressão');
      return file;
    }
  }

  /**
   * Verifica se um arquivo precisa de compressão
   */
  needsCompression(file) {
    if (file.type.startsWith('video/')) {
      return this.getVideoCompressionSettings(file.size) !== null;
    } else if (file.type.startsWith('image/')) {
      return this.getImageCompressionSettings(file.size) !== null;
    }
    return false;
  }
}

// Instância singleton
const mediaBunnyCompression = new MediaBunnyCompression();

export default mediaBunnyCompression;

// Exportar também as funções individuais para facilitar o uso
export const {
  compressVideo,
  compressImage,
  compressFile,
  needsCompression
} = mediaBunnyCompression;