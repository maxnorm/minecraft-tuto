import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

export class World extends THREE.Group {
  /**
   * @type {{
   *  id: number;
   *  instanceId: number;
   * }[][][]}
   */
  data = [];

  params = {
    terrain: {
      scale: 30,
      magnitude: 0.5,
      offset: 0.2,
    }
  }

  constructor(size = { width: 64, height: 32 }) {
    super();
    this.size = size;
  }

  generate() {
    this.initializeTerrain();
    this.generateTerrain();
    this.generateMeshes();
  }

  /**
   * Initializes the terrain data.
   * @returns {void}
   */
  initializeTerrain() {
    this.data = [];
    for (let x = 0; x < this.size.width; x++) {
      const slice = [];
      for (let y = 0; y < this.size.height; y++) {
        const row = [];
        for (let z = 0; z < this.size.width; z++) {
          row.push({ 
            id: 0,  
            instanceId: null 
          });
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  /**
   * Generates the terrain data.
   * @returns {void}
   */
  generateTerrain() {
    const simplex = new SimplexNoise();

    for (let x = 0; x < this.size.width; x++) {
      for (let z = 0; z < this.size.width; z++) {
        const value = simplex.noise(
          x / this.params.terrain.scale, 
          z / this.params.terrain.scale
        );

        const scaledNoise = this.params.terrain.offset +
          this.params.terrain.magnitude * value;

        let height = Math.floor(this.size.height * scaledNoise);
        height = Math.max(0, Math.min(height, this.size.height - 1));

        for (let y = 0; y <= height; y++) {
          this.setBlockId(x, y, z, 1);
        }
      }
    }
  }

  /**
   * Generates the 3D representation of the terrain.
   * @returns {void}
   */
  generateMeshes() {
    this.clear();

    const maxCount = this.size.width * this.size.height * this.size.width;
    const mesh = new THREE.InstancedMesh(geometry, material, maxCount);
    mesh.count = 0;

    const matrix = new THREE.Matrix4();
    for (let x = 0; x < this.size.width; x++) {
      for (let y = 0; y < this.size.height; y++) {
        for (let z = 0; z < this.size.width; z++) {
          const blockId = this.getBlock(x, y, z).id;
          const instanceId = mesh.count;

          if (blockId !== 0) {
            matrix.setPosition(x + 0.5, y + 0.5, z + 0.5);
            mesh.setMatrixAt(instanceId, matrix);
            this.setBlockInstanceId(x, y, z, instanceId);
            mesh.count++;
          }
        }
      }
    }

    this.add(mesh);
  }

  /**
   * Set the id of the block at the given position.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @param {number} z - The z coordinate.
   * @param {number} id - The id of the block.
   * @returns {void}
   */
  setBlockId(x, y, z, id) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].id = id;
    }
  }

  /**
   * Set the instance id of the block at the given position.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @param {number} z - The z coordinate.
   * @param {number} instanceId - The instance id of the block.
   * @returns {void}
   */
  setBlockInstanceId(x, y, z, instanceId) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].instanceId = instanceId;
    }
  }

  /**
   * Get the block at the given position.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @param {number} z - The z coordinate.
   * @returns {{ id: number, instanceId: number }} The block at the given position.
   */
  getBlock(x, y, z) {
    if (this.inBounds(x, y, z)) {
      return this.data[x][y][z];
    }
    return null;
  }

  /**
   * Check if the given position is within the bounds of the world.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @param {number} z - The z coordinate.
   * @returns {boolean} True if the position is within the bounds, false otherwise.
   */
  inBounds(x, y, z) {
    return x >= 0 && x < this.size.width &&
      y >= 0 && y < this.size.height &&
      z >= 0 && z < this.size.width;
  }
}