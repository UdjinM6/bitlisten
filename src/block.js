/** 
 *  @constructor
 *  @extends Floatable
 */
function Block(height, numTransactions, difficulty, blockSize) {
	if (document.visibilityState === "visible") {
		Floatable.call(this);

		var blockSizeKB = Math.floor(blockSize / 1024).toFixed(2) + " KB";

		var maxBlockSize = 2 * 1024 * 1024;
		var minSize = 200;
		var maxSize = 500;
		this.width = this.height = Math.min(Math.max(maxSize * Math.sqrt(blockSize / maxBlockSize), minSize), maxSize);

		var difficultyM = difficulty / 1000 / 1000;
		this.addImage(blockImage, this.width, this.height);
		this.addText("Block #" + height + "<br />Number of Transactions: " + numTransactions + "<br />Block Difficulty: " + difficultyM.toFixed(2) + "M<br />Block Size: " + blockSizeKB);
		this.initPosition();
	
        // Sound
        Sound.playRandomSwell();
	}
}

extend(Floatable, Block);
